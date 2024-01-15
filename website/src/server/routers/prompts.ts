import { z } from "zod"
import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"
import { TRPCError } from "@trpc/server"
import { Prompt } from "@prisma/client"

type PromptTypeContent = {
    SUMMARY: { text: string }
    QUIZ: {
        questions: {
            question: string
            answers: { text: string; correct: boolean }[]
        }[]
    }
}

type PromptType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    title: string
    /** The requesting users reaction on this prompt. Null if they haven't reacted else true/false depending on how they reacted to it. */
    reaction: boolean | null
    score: number
} & (
    | {
          type: "SUMMARY"
          content: PromptTypeContent["SUMMARY"]
      }
    | {
          type: "QUIZ"
          content: PromptTypeContent["QUIZ"]
      }
)

async function formatPrompt(
    prompt: Prompt,
    userId: string,
): Promise<PromptType> {
    const [positiveReactions, negativeReactions, userReaction] =
        await Promise.all([
            db.promptReaction.count({
                where: {
                    promptId: prompt.id,
                    positive: true,
                },
            }),
            db.promptReaction.count({
                where: {
                    promptId: prompt.id,
                    positive: false,
                },
            }),
            db.promptReaction.findUnique({
                where: {
                    promptId_userId: {
                        promptId: prompt.id,
                        userId,
                    },
                },
                select: { id: true, positive: true },
            }),
        ])

    const score = positiveReactions - negativeReactions

    return {
        id: prompt.id,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        userId: prompt.userId,
        title: prompt.title,
        reaction: !userReaction ? null : userReaction.positive,
        // type: ""
        type: prompt.type as "QUIZ" | "SUMMARY",
        content: prompt.content as any,
        score,
    }
}

export const promptRouter = router({
    updateQuizPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                quiz: z.object({
                    title: z.string().max(128),
                    content: z.object({
                        questions: z.array(
                            z.object({
                                question: z.string(),
                                answers: z.array(
                                    z.object({
                                        text: z.string(),
                                        correct: z.boolean(),
                                    }),
                                ),
                            }),
                        ),
                    }),
                }),
            }),
        )
        .mutation(async function ({ ctx, input }): Promise<void> {
            const prompt = await db.prompt.findUnique({
                where: { id: input.promptId },
                select: { userId: true, type: true },
            })

            if (!prompt) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "The quiz you tried to update doesn't exist.",
                })
            }

            if (prompt.type !== "QUIZ") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "The prompt you tried to edit is not a quiz.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id
            if (ctx.user.type === "STUDENT" && !isUserOwner) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can't edit quizes you haven't made.",
                })
            }

            // In case of other types being added in future
            if (ctx.user.type !== "TEACHER") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You must be a teacher to edit prompts you haven't created.",
                })
            }

            await db.prompt.update({
                where: {
                    id: input.promptId,
                },
                data: {
                    title: input.quiz.title,
                    content: input.quiz.content,
                },
            })
        }),
    deletePromptById: userProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async function ({ input, ctx }) {
            const prompt = await db.prompt.findUnique({
                where: { id: input.id },
                select: {
                    userId: true,
                },
            })

            if (!prompt) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Couldn't find the prompt you wanted to delete.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id

            if (ctx.user.type === "STUDENT" && !isUserOwner) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can only delete prompt you have made.",
                })
            }

            if (ctx.user.type !== "TEACHER") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You can't delete others prompts unless you're a teacher.",
                })
            }

            await db.prompt.delete({
                where: { id: input.id },
            })
        }),
    getPromptById: userProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async function ({ input, ctx }): Promise<PromptType> {
            const summary = await db.prompt.findUnique({
                where: { id: input.id },
            })
            if (!summary) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Couldn't find the prompt you requested.",
                })
            }
            return formatPrompt(summary, ctx.user.id)
        }),
    getPrompts: userProcedure
        .input(z.object({ course: z.string() }))
        .query(async function ({ input, ctx }): Promise<PromptType[]> {
            const prompts = await db.prompt.findMany({
                orderBy: { createdAt: "desc" },
                take: 25,
                where: { course: { name: input.course } },
            })

            const formatted = await Promise.all(
                prompts.map(
                    (prompt) =>
                        new Promise<PromptType>(async (res) => {
                            res(formatPrompt(prompt, ctx.user.id))
                        }),
                ),
            )

            return formatted
        }),
    react: userProcedure
        .input(
            z.object({
                type: z.enum(["QUIZ", "SUMMARY"]),
                positive: z.boolean(),
                promptId: z.string().uuid(),
            }),
        )
        .mutation(async function ({ ctx, input }): Promise<void> {
            const { promptId, positive, type } = input
            const { id: userId } = ctx.user

            const existing = await db.promptReaction.findUnique({
                where: {
                    promptId_userId: {
                        promptId: promptId,
                        userId,
                    },
                },
                select: { id: true, positive: true },
            })

            // Delete if reacting with same as already existing
            if (existing?.positive === positive) {
                await db.promptReaction.delete({
                    where: {
                        id: existing.id,
                    },
                })
            } else {
                await db.promptReaction.upsert({
                    where: {
                        promptId_userId: {
                            promptId,
                            userId,
                        },
                    },
                    create: {
                        promptId,
                        userId,
                        positive,
                    },
                    update: {
                        promptId,
                        userId,
                        positive,
                    },
                })
            }
        }),
})

// export type definition of API
export type AppRouter = typeof promptRouter

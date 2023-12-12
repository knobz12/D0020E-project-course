import { z } from "zod"
import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"
import { TRPCError } from "@trpc/server"

export const promptRouter = router({
    deleteQuizPromptById: userProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async function ({ input, ctx }) {
            const quiz = await db.quizPrompt.findUnique({
                where: { id: input.id },
                select: {
                    userId: true,
                },
            })

            if (!quiz) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Couldn't find the quiz you wanted to delete.",
                })
            }

            if (ctx.user.id !== quiz.userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can only delete quizes you have made.",
                })
            }

            await db.quizPrompt.delete({
                where: { id: input.id },
            })
        }),
    getQuizPromptById: userProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async function ({ input }) {
            const quiz = await db.quizPrompt.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    title: true,
                    userId: true,
                    content: true,
                },
            })
            return quiz
        }),
    getPrompts: userProcedure
        .input(z.object({ course: z.string() }))
        .query(async function ({ input, ctx }) {
            interface PromptType {
                id: string
                userId: string
                title: string
                createdAt: string
                type: "QUIZ" | "SUMMARY"
                reaction: boolean | null
                score: number
            }
            async function getQuizes() {
                const quizes = await db.quizPrompt.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 25,
                    where: { course: { name: input.course } },
                    select: {
                        id: true,
                        userId: true,
                        title: true,
                        createdAt: true,
                        reactions: {
                            where: { userId: ctx.user.id },
                            select: { id: true, positive: true },
                        },
                    },
                })

                const formatted = await Promise.all(
                    quizes.map(
                        (quiz) =>
                            new Promise<PromptType>(async (res) => {
                                const [positiveReactions, negativeReactions] =
                                    await Promise.all([
                                        db.quizPromptReaction.count({
                                            where: {
                                                quizPromptId: quiz.id,
                                                positive: true,
                                            },
                                        }),
                                        db.quizPromptReaction.count({
                                            where: {
                                                quizPromptId: quiz.id,
                                                positive: false,
                                            },
                                        }),
                                    ])

                                const score =
                                    positiveReactions - negativeReactions

                                res({
                                    id: quiz.id,
                                    userId: quiz.userId,
                                    title: quiz.title,
                                    reaction:
                                        quiz.reactions.length === 0
                                            ? null
                                            : quiz.reactions.at(0)!.positive,
                                    createdAt: quiz.createdAt.toISOString(),
                                    type: "QUIZ",
                                    score,
                                })
                            }),
                    ),
                )

                return formatted
            }

            async function getSummaries() {
                const summaries = await db.summaryPrompt.findMany({
                    orderBy: { createdAt: "desc" },
                    take: 25,
                    where: { course: { name: input.course } },
                    select: {
                        id: true,
                        userId: true,
                        title: true,
                        createdAt: true,
                        reactions: {
                            where: { userId: ctx.user.id },
                            select: { id: true, positive: true },
                        },
                    },
                })

                const formatted = await Promise.all(
                    summaries.map(
                        (summary) =>
                            new Promise<PromptType>(async (res) => {
                                const [positiveReactions, negativeReactions] =
                                    await Promise.all([
                                        db.summaryPromptReaction.count({
                                            where: {
                                                summaryPromptId: summary.id,
                                                positive: true,
                                            },
                                        }),
                                        db.summaryPromptReaction.count({
                                            where: {
                                                summaryPromptId: summary.id,
                                                positive: false,
                                            },
                                        }),
                                    ])

                                const score =
                                    positiveReactions - negativeReactions

                                res({
                                    id: summary.id,
                                    userId: summary.userId,
                                    title: summary.title,
                                    reaction:
                                        summary.reactions.length === 0
                                            ? null
                                            : summary.reactions.at(0)!.positive,
                                    createdAt: summary.createdAt.toISOString(),
                                    type: "SUMMARY",
                                    score,
                                })
                            }),
                    ),
                )

                return formatted
            }

            const [quizes, summaries] = await Promise.all([
                getQuizes(),
                getSummaries(),
            ])

            // Combine into one list ordered by created at date
            const prompts = [...quizes, ...summaries].sort((a, b) =>
                new Date(a.createdAt).valueOf() <
                new Date(b.createdAt).valueOf()
                    ? 1
                    : -1,
            )

            return prompts
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

            if (type === "QUIZ") {
                const existing = await db.quizPromptReaction.findUnique({
                    where: {
                        quizPromptId_userId: {
                            quizPromptId: promptId,
                            userId,
                        },
                    },
                    select: { id: true, positive: true },
                })

                // Delete if reacting with same as already existing
                if (existing?.positive === positive) {
                    await db.quizPromptReaction.delete({
                        where: {
                            id: existing.id,
                        },
                    })
                } else {
                    await db.quizPromptReaction.upsert({
                        where: {
                            quizPromptId_userId: {
                                quizPromptId: promptId,
                                userId,
                            },
                        },
                        create: {
                            quizPromptId: promptId,
                            userId,
                            positive,
                        },
                        update: {
                            quizPromptId: promptId,
                            userId,
                            positive,
                        },
                    })
                }
            } else if (type === "SUMMARY") {
                const existing = await db.summaryPromptReaction.findUnique({
                    where: {
                        summaryPromptId_userId: {
                            summaryPromptId: promptId,
                            userId,
                        },
                    },
                    select: { id: true, positive: true },
                })

                // Delete if reacting with same as already existing
                if (existing?.positive === positive) {
                    await db.quizPromptReaction.delete({
                        where: {
                            id: existing.id,
                        },
                    })
                } else {
                    await db.summaryPromptReaction.upsert({
                        where: {
                            summaryPromptId_userId: {
                                summaryPromptId: promptId,
                                userId,
                            },
                        },
                        create: {
                            summaryPromptId: promptId,
                            userId,
                            positive,
                        },
                        update: {
                            summaryPromptId: promptId,
                            userId,
                            positive,
                        },
                    })
                }
            }
        }),
})

// export type definition of API
export type AppRouter = typeof promptRouter

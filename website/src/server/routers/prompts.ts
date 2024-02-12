import { z } from "zod"
import {
    publicProcedure,
    router,
    teacherProcedure,
    userProcedure,
} from "../trpc"
import { db } from "@/lib/database"
import { TRPCError } from "@trpc/server"
import type { Prompt } from "@prisma/client"
import { PromptType as PrismaPromptType } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { addMinutes, isFuture, isPast, subMinutes } from "date-fns"

type PromptTypeContent = {
    SUMMARY: { text: string }
    ASSIGNMENT: { text: string }
    QUIZ: {
        questions: {
            question: string
            answers: { text: string; correct: boolean }[]
        }[]
    }
    EXPLAINER: {
        keywords: {
            keyword: string
            explanation: string 
        }[]
    }
    FLASHCARDS: {
        questions: {
            question: string
            answer: string
        }[]
    }
}

type TeacherNote = {
    text: string
    title: string
    user: {
        id: string
        name: string | null
        image: string | null
    }
}

type PromptType = {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    title: string
    courseId: string
    courseName: string
    /** The requesting users reaction on this prompt. Null if they haven't reacted else true/false depending on how they reacted to it. */
    published: boolean
    reaction: boolean | null
    teacherNote?: TeacherNote
    pinned: boolean
    score: number
} & (
    | {
          type: "SUMMARY"
          content: PromptTypeContent["SUMMARY"]
      }
    | {
          type: "ASSIGNMENT"
          content: PromptTypeContent["ASSIGNMENT"]
      }
    | {
          type: "QUIZ"
          content: PromptTypeContent["QUIZ"]
      }
    | {
        type: "EXPLAINER"
        content: PromptTypeContent["EXPLAINER"]
    }
    | {
          type: "FLASHCARDS"
          content: PromptTypeContent["FLASHCARDS"]
      }
)

async function formatPrompt(
    prompt: Prompt & { course: { name: string } },
    userId?: string | null,
): Promise<PromptType> {
    const [positiveReactions, negativeReactions, userReaction, teacherNote] =
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
            userId
                ? db.promptReaction.findUnique({
                      where: {
                          promptId_userId: {
                              promptId: prompt.id,
                              userId,
                          },
                      },
                      select: { id: true, positive: true },
                  })
                : null,
            db.teacherNote.findUnique({
                where: {
                    promptId: prompt.id,
                },
                select: {
                    title: true,
                    text: true,
                    user: { select: { id: true, name: true, image: true } },
                },
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
        type: prompt.type as "FLASHCARDS" | "QUIZ" | "SUMMARY" | "ASSIGNMENT"| "EXPLAINER",
        courseId: prompt.courseId,
        published: prompt.published,
        courseName: prompt.course.name,
        content: prompt.content as any,
        teacherNote: teacherNote ?? undefined,
        pinned: prompt.pinned,
        score,
    }
}

export const promptRouter = router({
    publishPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
            }),
        )
        .mutation(async function ({
            ctx,
            input,
        }): Promise<{ published: boolean }> {
            const prompt = await db.prompt.findUnique({
                where: { id: input.promptId },
                select: { userId: true, published: true },
            })

            if (!prompt) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "The prompt you tried to publish doesn't exist.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id
            if (!isUserOwner) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You can't publish prompts you haven't made.",
                })
            }

            // if (prompt.published) {
            //     throw new TRPCError({
            //         code: "NOT_FOUND",
            //         message: "This prompt has already been published.",
            //     })
            // }

            await db.prompt.update({
                where: {
                    id: input.promptId,
                },
                data: { published: !prompt.published },
            })

            return { published: !prompt.published }
        }),
    updateQuizPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                quiz: z.object({
                    title: z.string().max(512).min(3),
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
            if (ctx.user.type === "STUDENT") {
                if (!isUserOwner) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You can't edit flashcards you haven't made.",
                    })
                }
            } else if (ctx.user.type !== "TEACHER") {
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
    updateFlashcardsPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                flashcards: z.object({
                    title: z.string().max(512),
                    content: z.object({
                        questions: z.array(
                            z.object({
                                question: z.string(),
                                answer: z.string(),
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
                    message:
                        "The flashcards you tried to update doesn't exist.",
                })
            }

            if (prompt.type !== "FLASHCARDS") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "The prompt you tried to edit is not a flashcards.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id

            if (ctx.user.type === "STUDENT") {
                if (!isUserOwner) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You can't edit flashcards you haven't made.",
                    })
                }
            } else if (ctx.user.type !== "TEACHER") {
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
                    title: input.flashcards.title,
                    content: input.flashcards.content,
                },
            })
        }),
    updateAssignmentPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                assignment: z.object({
                    title: z.string().max(512).min(3),
                    content: z.object({
                        text: z.string().max(Math.pow(2, 14)),
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
                    message:
                        "The assignment you tried to update doesn't exist.",
                })
            }

            if (prompt.type !== "ASSIGNMENT") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "The prompt you tried to edit is not a quiz.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id
            if (ctx.user.type === "STUDENT") {
                if (!isUserOwner) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You can't edit assignment you haven't made.",
                    })
                }
            } else if (ctx.user.type !== "TEACHER") {
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
                    title: input.assignment.title,
                    content: input.assignment.content,
                },
            })
        }),
    updateSummaryPrompt: userProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                summary: z.object({
                    title: z.string().max(512).min(3),
                    content: z.object({
                        text: z.string().max(Math.pow(2, 12)),
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
                    message: "The summary you tried to update doesn't exist.",
                })
            }

            if (prompt.type !== "SUMMARY") {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "The prompt you tried to edit is not a summary.",
                })
            }

            const isUserOwner = prompt.userId === ctx.user.id
            if (ctx.user.type === "STUDENT") {
                if (!isUserOwner) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You can't edit summaries you haven't made.",
                    })
                }
            } else if (ctx.user.type !== "TEACHER") {
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
                    title: input.summary.title,
                    content: input.summary.content,
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

            if (ctx.user.type === "STUDENT") {
                if (!isUserOwner) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You can't edit summaries you haven't made.",
                    })
                }
            } else if (ctx.user.type !== "TEACHER") {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message:
                        "You must be a teacher to edit prompts you haven't created.",
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
                include: { course: { select: { name: true } } },
            })
            if (!summary) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Couldn't find the prompt you requested.",
                })
            }
            return formatPrompt(summary, ctx.user.id)
        }),
    getNonAndPinnedPrompts: publicProcedure
        .input(
            z.object({ course: z.string(), page: z.number().min(1).max(1000) }),
        )
        .query(async function ({ input, ctx }): Promise<{
            pinned: PromptType[]
            prompts: PromptType[]
            total: number
        }> {
            const course = await db.course.findUnique({
                where: { name: input.course },
                select: { id: true },
            })

            if (!course) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Could not course with name '${input.course}'.`,
                })
            }

            const [totalPromptCount, pinned, nonPinned] = await Promise.all([
                db.prompt.count({
                    where: { courseId: course.id, published: true },
                }),
                // Only get pinned for page 1.
                input.page === 1
                    ? db.prompt.findMany({
                          where: {
                              pinned: true,
                              courseId: course.id,
                              published: true,
                          },
                          orderBy: { createdAt: "desc" },
                          // There should only ever be at most 5 pinned prompts.
                          take: 5,
                          include: { course: { select: { name: true } } },
                      })
                    : [],
                db.prompt.findMany({
                    where: {
                        pinned: false,
                        courseId: course.id,
                        published: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 15,
                    skip: (input.page - 1) * 15,
                    include: { course: { select: { name: true } } },
                }),
            ])

            const [formattedPinned, formattedNonPinned] = await Promise.all([
                Promise.all(
                    pinned.map(
                        (prompt) =>
                            new Promise<PromptType>(async (res) => {
                                res(formatPrompt(prompt, ctx.user?.id))
                            }),
                    ),
                ),
                Promise.all(
                    nonPinned.map(
                        (prompt) =>
                            new Promise<PromptType>(async (res) => {
                                res(formatPrompt(prompt, ctx.user?.id))
                            }),
                    ),
                ),
            ])

            return {
                pinned: formattedPinned,
                prompts: formattedNonPinned,
                // total: Math.max(1, Math.floor(totalPromptCount / 15)),
                total: Math.ceil(totalPromptCount / 15),
            }
        }),
    getMyPrompts: userProcedure
        .input(z.object({ search: z.string().nullish() }))
        .query(async function ({ input, ctx }): Promise<PromptType[]> {
            const prompts = await db.prompt.findMany({
                orderBy: { createdAt: "desc" },
                take: 25,
                where: {
                    userId: ctx.user.id,
                    title: !!input.search
                        ? { contains: `${input.search}`, mode: "insensitive" }
                        : undefined,
                },
                include: { course: { select: { name: true } } },
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
                type: z.enum(["FLASHCARDS", "QUIZ", "SUMMARY", "ASSIGNMENT", "EXPLAINER"]),
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
    createTeacherNote: teacherProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
                title: z.string().max(128),
                text: z.string().max(4096),
            }),
        )
        .mutation(async function ({ ctx, input }) {
            const prompt = await db.prompt.findUnique({
                where: { id: input.promptId },
                select: {
                    id: true,
                    teacherNote: { select: { promptId: true } },
                },
            })

            if (!prompt) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Could not find prompt.",
                })
            }

            if (prompt.teacherNote !== null) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Prompt already has a teacher note.",
                })
            }

            await db.teacherNote.create({
                data: {
                    userId: ctx.user.id,
                    promptId: input.promptId,
                    title: input.title,
                    text: input.text,
                },
            })
        }),
    deleteTeacherNote: teacherProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
            }),
        )
        .mutation(async function ({ input }) {
            try {
                await db.teacherNote.delete({
                    where: {
                        promptId: input.promptId,
                    },
                })
            } catch (e) {
                if (
                    e instanceof PrismaClientKnownRequestError &&
                    // Not found code
                    e.code === "P2015"
                ) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message:
                            "Could not find the note you wanted to delete.",
                    })
                }

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message:
                        "Something went wrong on the server when trying to delete note.",
                })
            }
        }),
    togglePromptPin: teacherProcedure
        .input(
            z.object({
                promptId: z.string().uuid(),
            }),
        )
        .mutation(async function ({ input }) {
            const prompt = await db.prompt.findUnique({
                where: { id: input.promptId },
                select: { id: true, pinned: true, courseId: true },
            })

            if (!prompt) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "The prompt you wanted to pin wasn't found.",
                })
            }

            const count = await db.prompt.count({
                where: { pinned: true, courseId: prompt.courseId },
            })

            const newValue = !prompt.pinned

            if (newValue === true && count >= 5) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message:
                        "There can only be up to 5 pinned prompts in a course. Unpin a prompt if you still want to prompt this prompt.",
                })
            }

            await db.prompt.update({
                where: { id: input.promptId },
                data: { pinned: newValue },
                select: { pinned: true },
            })
        }),
    getMyLatestPrompts: userProcedure
        .input(
            z.object({
                course: z.string(),
                type: z.nativeEnum(PrismaPromptType),
            }),
        )
        .query(async function ({ ctx, input }) {
            const course = await db.course.findUnique({
                where: { name: input.course },
                select: { id: true },
            })

            if (!course) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Could not course with name '${input.course}'.`,
                })
            }

            const prompt = await db.prompt.findFirst({
                where: { userId: ctx.user.id },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    createdAt: true,
                    type: true,
                    course: { select: { name: true } },
                },
            })

            if (!prompt || prompt.type !== input.type) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Could not find your latest prompt.`,
                })
            }

            // Assume this prompt is the generated one if it was created within 3 minutes from now.
            if (isPast(addMinutes(prompt.createdAt, 3))) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Could not find your latest prompt.`,
                })
            }

            return prompt
        }),
})

// export type definition of API
export type AppRouter = typeof promptRouter

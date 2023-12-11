import { z } from "zod"
import { router, userProcedure } from "../trpc"
import { db } from "@/lib/database"

export const promptRouter = router({
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

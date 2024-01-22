import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"

export const coursesRouter = router({
    getCourses: publicProcedure.query(async function ({ input, ctx }) {
        return db.course.findMany({
            select: {
                id: true,
                name: true,
                title: true,
                tablerIcon: true,
                coursePage: true,
                description: true,
                prompts: { select: { _count: true } },
            },
        })
    }),
})

// export type definition of API
export type AppRouter = typeof coursesRouter

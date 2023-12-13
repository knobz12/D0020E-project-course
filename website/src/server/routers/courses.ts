import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"

export const coursesRouter = router({
    getCourses: publicProcedure.query(async function ({ input, ctx }) {
        return db.course.findMany({ select: { id: true, name: true } })
    }),
})

// export type definition of API
export type AppRouter = typeof coursesRouter

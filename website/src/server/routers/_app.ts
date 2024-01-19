import { router } from "../trpc"
import { coursesRouter } from "./courses"
import { filesRouter } from "./files"
import { promptRouter } from "./prompts"

export const appRouter = router({
    prompts: promptRouter,
    courses: coursesRouter,
    files: filesRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

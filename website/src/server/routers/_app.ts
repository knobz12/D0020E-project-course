import { router } from "../trpc"
import { coursesRouter } from "./courses"
import { promptRouter } from "./prompts"

export const appRouter = router({
    prompts: promptRouter,
    courses: coursesRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

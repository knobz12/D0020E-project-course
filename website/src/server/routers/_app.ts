import { router } from "../trpc"
import { promptRouter } from "./prompt"

export const appRouter = router({
    prompts: promptRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

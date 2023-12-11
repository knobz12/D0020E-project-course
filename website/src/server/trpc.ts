import { createContext } from "@/pages/api/trpc/[trpc]"
import { TRPCError, initTRPC } from "@trpc/server"

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router

// Queries or mutations which don't require a user. Querying for prompts for example.
export const publicProcedure = t.procedure

const loggedIn = t.middleware(async (opts) => {
    if (opts.ctx.user === null) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this route.",
        })
    }

    return opts.next({
        ctx: {
            user: opts.ctx.user,
        },
    })
})

// Queries or mutations which require the user to be logged in. Mutations such as reacting to prompts for example.
export const userProcedure = publicProcedure.use(loggedIn)

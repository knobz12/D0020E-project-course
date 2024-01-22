import { createContext } from "@/pages/api/trpc/[trpc]"
import { TRPCError, initTRPC } from "@trpc/server"
import superjson from "superjson"

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({ transformer: superjson })

export const router = t.router

// Queries or mutations which don't require a user. Querying for prompts for example.
export const publicProcedure = t.procedure

const loggedIn = t.middleware(async (opts) => {
    if (opts.ctx.user === null) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to do this.",
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

const isTeacher = t.middleware(async (opts) => {
    if (opts.ctx.user === null) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to access this route.",
        })
    }

    if (opts.ctx.user.type !== "TEACHER") {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be a teacher to do this.",
        })
    }

    return opts.next({
        ctx: {
            user: opts.ctx.user,
        },
    })
})

// Queries or mutations which require the user to be logged in and a teacher. Mutations such as adding teacher notes for example.
export const teacherProcedure = publicProcedure.use(loggedIn).use(isTeacher)

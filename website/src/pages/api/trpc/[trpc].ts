import * as trpcNext from "@trpc/server/adapters/next"
import { appRouter } from "../../../server/routers/_app"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { db } from "@/lib/database"

export const createContext = async ({
    req,
    res,
}: trpcNext.CreateNextContextOptions) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
        return { user: null }
    }

    const user = await db.user.findUnique({
        where: { email: session.user?.email },
        select: { id: true, name: true, email: true },
    })

    return { user }
}

export default trpcNext.createNextApiHandler({
    router: appRouter,
    // Create context accessible by all router endpoints
    createContext,
})

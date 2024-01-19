import NextAuth, { DefaultSession } from "next-auth"
import type { UserType } from "@prisma/client"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's database ID as UUID-v4. */
            userId: string
            /** The type of the user. */
            type: UserType
        } & DefaultSession["user"]
    }
}

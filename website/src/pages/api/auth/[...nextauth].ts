import NextAuth, { AuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"
import { db } from "@/lib/database"

const cookiePrefix = "aisb"

export const authOptions: AuthOptions = {
    theme: {
        logo: "https://cdn.aistudybuddy.se/logo.png",
        brandColor: "#01a0da",
    },
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/login",
        newUser: "/auth/signup",
    },
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}.session-token`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        callbackUrl: {
            name: `${cookiePrefix}.callback-url`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        csrfToken: {
            name: `${cookiePrefix}.csrf-token`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
        pkceCodeVerifier: {
            name: `${cookiePrefix}.pkce.code_verifier`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 900,
            },
        },
        state: {
            name: `${cookiePrefix}.state`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
                maxAge: 900,
            },
        },
        nonce: {
            name: `${cookiePrefix}.nonce`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
    },
    providers: [
        ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
            ? [
                  GithubProvider({
                      clientId: process.env.GITHUB_ID,
                      clientSecret: process.env.GITHUB_SECRET,
                  }),
              ]
            : []),
        ...(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
            ? [
                  GoogleProvider({
                      clientId: process.env.GOOGLE_ID,
                      clientSecret: process.env.GOOGLE_SECRET,
                  }),
              ]
            : []),
    ],
    callbacks: {
        async session(params) {
            // console.log("SESSSSION:", params)

            const email = params.session.user.email

            if (!email) {
                throw new Error("Could not find user!")
            }

            const dbUser = await db.user.findUnique({
                where: { email },
                select: { type: true },
            })

            if (!dbUser) {
                throw new Error("Could not find user!")
            }

            if (params.token.userId) {
                return {
                    ...params.session,
                    user: {
                        ...params.session.user,
                        userId: params.token.userId,
                        type: dbUser.type,
                    },
                }
            }

            return params.session
        },
        async signIn(params) {
            try {
                const user = params.user.email
                    ? await db.user.findUnique({
                          where: { email: params.user.email },
                          select: { id: true },
                      })
                    : null

                if (!user || !user.id) {
                    await db.user.create({
                        data: {
                            email: params.user.email,
                            name: params.user.name,
                            image: params.user.image,
                        },
                    })
                }

                return true
            } catch (e) {
                console.error(e)
                return false
            }
        },
    },
    jwt: {
        async encode({ token, secret, maxAge, salt }) {
            if (!token || !token.email) {
                throw new Error("No token!")
            }

            const user = await db.user
                .findUnique({
                    where: { email: token.email },
                    select: { id: true },
                })
                .catch((e) => null)

            const encoded = jwt.sign(
                { ...token, userId: user?.id ?? null },
                secret,
                {
                    algorithm: "HS256",
                },
            )
            return encoded
        },
        async decode({ token, secret, salt }) {
            const verify = jwt.verify(token!, secret)
            return verify as any
        },
    },
}

export default NextAuth(authOptions)

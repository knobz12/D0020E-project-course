import NextAuth, { AuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

const cookiePrefix = "aisb"

export const authOptions: AuthOptions = {
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}.session-token`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
        callbackUrl: {
            name: `${cookiePrefix}.callback-url`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
        csrfToken: {
            name: `${cookiePrefix}.csrf-token`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
        pkceCodeVerifier: {
            name: `${cookiePrefix}.pkce.code_verifier`,
            options: {
                domain: process.env.COOKIE_DOMAIN,
                httpOnly: true,
                sameSite: "lax",
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
                sameSite: "lax",
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
                sameSite: "lax",
                path: "/",
                secure: true,
            },
        },
    },
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        // ...add more providers here
    ],
    callbacks: {
        signIn(params) {
            // if (params.account.)
            console.log("signin params:", params)
            return true
        },
        // jwt(params) {
        //   console.log("jwt PARAMS:", params);
        //   return params.token.token;
        // },
        // session(params) {
        //   console.log("session PARAMS:", params);
        //   return params.session;
        // },
    },
    jwt: {
        async encode({ token, secret, maxAge, salt }) {
            if (!token) {
                throw new Error("No token!")
            }

            console.log("Encoding token:", token)
            const encoded = jwt.sign(token, secret, { algorithm: "HS256" })
            console.log("Encoded:", encoded)
            return encoded
        },
        async decode({ token, secret, salt }) {
            console.log("Verifying token:", token)
            const verify = jwt.verify(token!, secret)
            console.log("Result:", verify)
            return verify as any
        },
    },
}

export default NextAuth(authOptions)

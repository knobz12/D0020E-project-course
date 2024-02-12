import { db } from "@/lib/database"
import { router, userProcedure } from "../trpc"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import * as jose from "jose"

interface OpenAI {
    enabled: boolean
    apiKey: string | null
}

if (!process.env.JWE_PEPPER) {
    throw new Error("Missing JWE_PEPPER ENV")
}

if (!process.env.JWE_SECRET) {
    throw new Error("Missing JWE_PEPPER ENV")
}

const SECRET = new TextEncoder().encode(process.env.JWE_SECRET)
const PEPPER = process.env.JWE_PEPPER

export const settingsRouter = router({
    getSettings: userProcedure.query(async function ({ ctx }): Promise<OpenAI> {
        const openAI = await db.openAI.findUnique({
            where: { userId: ctx.user.id },
            select: { enabled: true, apiKey: true },
        })

        if (!openAI) {
            await db.openAI.create({
                data: { apiKey: null, enabled: false, userId: ctx.user.id },
            })

            return { enabled: false, apiKey: null }
        }

        if (!openAI.apiKey) {
            return {
                enabled: openAI.enabled,
                apiKey: null,
            }
        }

        try {
            const key = await jose.compactDecrypt(openAI.apiKey, SECRET)

            if (!key?.plaintext) {
                // Go to the catch block
                throw new Error("Invalid JWE")
            }
            const plain = Buffer.from(key.plaintext).toString("utf-8")
            const real = plain.replace(PEPPER, "")

            return {
                enabled: openAI.enabled,
                apiKey: real,
            }
        } catch (e) {
            console.log("Decryption failed! Resetting")
            await db.openAI.upsert({
                where: { userId: ctx.user.id },
                create: { apiKey: null, enabled: false, userId: ctx.user.id },
                update: { apiKey: null, enabled: false, userId: ctx.user.id },
            })
            return { enabled: false, apiKey: null }
        }
    }),
    updateSettings: userProcedure
        .input(
            z.object({
                enabled: z.boolean(),
                apiKey: z.string().max(256).nullable(),
            }),
        )
        .mutation(async function ({ ctx, input }): Promise<void> {
            const key = input.apiKey
                ? await new jose.CompactEncrypt(
                      new TextEncoder().encode(PEPPER + input.apiKey),
                  )
                      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
                      .encrypt(SECRET)
                : null

            const data: Prisma.OpenAIUpsertArgs["create"] = {
                userId: ctx.user.id,
                enabled: input.enabled,
                apiKey: key,
            }
            await db.openAI.upsert({
                where: { userId: ctx.user.id },
                create: data,
                update: data,
            })
        }),
})

// export type definition of API
export type AppRouter = typeof settingsRouter

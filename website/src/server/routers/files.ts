import { z } from "zod"
import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"
import { ChromaClient, IncludeEnum } from "chromadb"

export const filesRouter = router({
    getFiles: publicProcedure
        .input(
            z.object({
                page: z.number().int().positive(),
            }),
        )
        .query(async function ({ input, ctx }) {
            const chroma = new ChromaClient({ path: "http://127.0.0.1:8000" })
            const collection = await chroma.getOrCreateCollection({
                name: "llama-2-papers",
            })
            const docCount = await collection.count()
            console.log(`Collection has ${docCount} documents`)

            const offsetNum = input.page - 1 * 25
            const response = await collection.get({
                limit: 5,
                offset:
                    docCount <= 25 ? 0 : offsetNum < 1 ? undefined : offsetNum,
                // We don't care about other chunks since we only want to get ID's
                // which are the same for all chunks.
                where: { "chunk-id": { $eq: "0" } },
                include: [IncludeEnum.Metadatas],
            })
            const files = response.metadatas
                .filter((meta) => meta !== null)
                .map((meta) => {
                    return {
                        id: meta!["id"] as string,
                        filename: meta!["filename"] as string,
                    }
                })
            return {
                docs: docCount,
                files,
                // files: Array(50)
                //     .fill(null)
                //     .reduce((prev, curr, idx) => [...prev, ...files]),
            }
        }),
})

// export type definition of API
export type AppRouter = typeof filesRouter

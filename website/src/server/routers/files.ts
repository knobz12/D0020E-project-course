import { z } from "zod"
import { publicProcedure, router, userProcedure } from "../trpc"
import { db } from "@/lib/database"
import { ChromaClient, IncludeEnum } from "chromadb"

export const filesRouter = router({
    getFiles: publicProcedure
        .input(
            z.object({
                page: z.number().int().min(1),
                course: z.string().max(64),
            }),
        )
        .query(async function ({ input }) {
            const DOCS_PER_PAGE = 10
            const chroma = new ChromaClient({ path: process.env.CHROMA_URL })
            const collection = await chroma.getOrCreateCollection({
                name: "llama-2-papers",
            })
            // const docCount = await collection.count()
            // TODO: Optimally we'd use the count function but with it we can't filter where
            // 'chunk-id' = 0. Meaning that we always get the count for all chunks. Temporary
            // solution is to use 'get' and count the ids. Not optimal but only solution for now.
            const allDocIds = await collection.get({
                where: { "chunk-id": { $eq: "0" } },
                // Safe limit so the server doesn't crash.
                limit: 1000,
                include: [],
            })
            const docCount = allDocIds.ids.length

            const offsetNum = (input.page - 1) * DOCS_PER_PAGE
            const offset =
                docCount <= DOCS_PER_PAGE
                    ? 0
                    : offsetNum < 1
                      ? undefined
                      : offsetNum
            const response = await collection.get({
                limit: DOCS_PER_PAGE,
                offset,
                // We don't care about other chunks since we only want to get ID's
                // which are the same for all chunks.
                where: {
                    $and: [
                        {
                            "chunk-id": { $eq: "0" },
                        },
                        {
                            course: { $eq: input.course },
                        },
                    ],
                },
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
                docsPerPage: DOCS_PER_PAGE,
                files,
            }
        }),
})

// export type definition of API
export type AppRouter = typeof filesRouter

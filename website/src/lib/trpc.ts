import { httpBatchLink } from "@trpc/client"
import { createTRPCNext } from "@trpc/next"
import type { AppRouter } from "../server/routers/_app"
import superjson from "superjson"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

function getBaseUrl() {
    if (typeof window !== "undefined")
        // browser should use relative path
        return ""
    // assume localhost
    return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCNext<AppRouter>({
    config(opts) {
        return {
            transformer: superjson,
            links: [
                httpBatchLink({
                    /**
                     * If you want to use SSR, you need to use the server's full URL
                     * @link https://trpc.io/docs/ssr
                     **/
                    url: `${getBaseUrl()}/api/trpc`,
                    // You can pass any HTTP headers you wish here
                    async headers() {
                        return {
                            cookie: opts.ctx?.req?.headers.cookie,
                            // authorization: getAuthCookie(),
                        }
                    },
                }),
            ],
        }
    },
    /**
     * @link https://trpc.io/docs/ssr
     **/
    ssr: true,
})

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

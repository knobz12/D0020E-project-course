// import { StreamingTextResponse } from "ai"

export const runtime = "edge"

export default async function handler(req: Request, res: Response) {
    const { size, delay } = (function () {
        const params = new URL(req.url).searchParams
        const size = params.get("size")
        const delay = params.get("delay")

        return {
            size: size ? parseInt(size) : undefined,
            delay: delay ? parseInt(delay) : undefined,
        }
    })()

    const stream = new ReadableStream({
        async start(controller) {
            async function* test(
                size: number = 10,
                delay: number = 500,
            ): AsyncGenerator<string> {
                console.log(size, delay)
                const vals = Array(size)
                    .fill(null)
                    .map((_, idx) => idx + 1)

                for (const val of vals) {
                    // yield `${val} `
                    yield `${val}\n`
                    await new Promise<void>((res) => setTimeout(res, delay))
                }
            }

            const gen = test(size, delay)
            for await (const val of gen) {
                controller.enqueue(val)
            }
            controller.close()
        },
    })

    return new StreamingTextResponse(stream)
}

/**
 * A utility class for streaming text responses.
 */
export class StreamingTextResponse extends Response {
    constructor(res: ReadableStream) {
        let processedStream = res

        super(processedStream as any, {
            status: 200,
            headers: {
                // "Content-Type": "text/html; charset=utf-8",
                "Content-Type": "text/event-stream; charset=utf-8",
                "transfer-encoding": "chunked",
            },
        })
    }
}

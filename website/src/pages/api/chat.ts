import OpenAI from "openai"
import { OpenAIStream, StreamingTextResponse, streamToResponse } from "ai"
import { ChatCompletionMessageParam, Models } from "openai/resources/index.mjs"

const openai = new OpenAI({
    // Local Open-AI API running Llama-2 13b-chat model using
    // https://github.com/abetlen/llama-cpp-python/tree/main#web-server
    baseURL: "http://127.0.0.1:8000/v1",
    // Needs to be set to something otherwise it crashes
    apiKey: "",
})

export const runtime = "edge"

export default async function handler(req: Request, res: Response) {
    const { messages } = (await req.json()) as {
        messages: ChatCompletionMessageParam[]
    }

    const systemPrompts = messages.filter(
        (message) => message.role === "system",
    )
    const filteredMessages = messages
        .filter((message) => message.role !== "system")
        .slice(-6)

    const goodMessages = [...systemPrompts, ...filteredMessages]

    if (filteredMessages.length !== messages.length) {
        console.log("Filtered from:", messages)
        console.log("To:", goodMessages)
    }

    const response = await openai.chat.completions.create({
        // model: "accounts/fireworks/models/llama-v2-70b-chat",
        model: "gpt-4",
        stream: true,
        messages: goodMessages,
        temperature: 0.75,
        frequency_penalty: 1 / 0.85,
        top_p: 1,
        ["top_k" as any]: 40,
        max_tokens: 1000,
    })

    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
}

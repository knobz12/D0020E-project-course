import type { SelectOptions } from "@clack/prompts"
import * as p from "@clack/prompts"
import { humanFileSize } from "../utils"
import fs, { createWriteStream } from "fs"
import { MODEL_FOLDER_PATH } from "../constants"
import path from "path"
import { pipeline } from "stream/promises"
import got from "got"
import { freemem, totalmem } from "os"

export type ModelValues = "Z7B" | "Z3B" | "L7B" | "L13B"

type OptionValue<T extends string = string> = {
    /** The value received when user has selected this option */
    value: T
    /** The text displayed to the user for the option */
    label: string
    /** Shown when highlighted in the CLI */
    hint?: string
}

export const options = [
    { value: "Z7B", label: "zephyr-7b-beta", hint: "3.08 - 7.7 GB" },
    { value: "Z3B", label: "stablelm-zephyr-3b", hint: "1.2 - 2.97 GB" },
    { value: "L13B", label: "llama-2-13b-chat", hint: "5.43 - 13.8 GB" },
    { value: "L7B", label: "llama-2-7b-chat", hint: "2.83 - 7.16 GB" },
] satisfies SelectOptions<OptionValue<ModelValues>[], string>["options"]

export const models: Partial<Record<ModelValues, OptionValue[]>> = {
    Z7B: [
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q2_K.gguf",
            label: "zephyr-7b-beta.Q2",
            hint: "3.08 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q3_K_M.gguf",
            label: "zephyr-7b-beta.Q3",
            hint: "3.52 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q4_K_M.gguf",
            label: "zephyr-7b-beta.Q4",
            hint: "4.37 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q5_K_M.gguf",
            label: "zephyr-7b-beta.Q5",
            hint: "5.13 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q6_K.gguf",
            label: "zephyr-7b-beta.Q6",
            hint: "5.94 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/zephyr-7B-beta-GGUF/resolve/main/zephyr-7b-beta.Q8_0.gguf",
            label: "zephyr-7b-beta.Q8",
            hint: "7.7 GB",
        },
    ],
    Z3B: [
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q2_K.gguf",
            label: "stable-zephyr-3b.Q2",
            hint: "1.2 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q3_K_M.gguf",
            label: "stable-zephyr-3b.Q3",
            hint: "1.39 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q4_K_M.gguf",
            label: "stable-zephyr-3b.Q4",
            hint: "1.71 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q5_K_M.gguf",
            label: "stable-zephyr-3b.Q5",
            hint: "1.99 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q6_K.gguf",
            label: "stable-zephyr-3b.Q6",
            hint: "2.3 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/stablelm-zephyr-3b-GGUF/resolve/main/stablelm-zephyr-3b.Q8_0.gguf",
            label: "stable-zephyr-3b.Q8",
            hint: "2.97 GB",
        },
    ],
    L13B: [
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q2_K.gguf",
            label: "llama-2-13b-chat.Q2",
            hint: "5.43 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q3_K_M.gguf",
            label: "llama-2-13b-chat.Q3",
            hint: "6.34 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q4_K_M.gguf",
            label: "llama-2-13b-chat.Q4",
            hint: "7.87 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q5_K_M.gguf",
            label: "llama-2-13b-chat.Q5",
            hint: "9.23 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q6_K.gguf",
            label: "llama-2-13b-chat.Q6",
            hint: "10.7 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/blob/main/llama-2-13b-chat.Q8_0.gguf",
            label: "llama-2-13b-chat.Q8",
            hint: "13.8 GB",
        },
    ],
    L7B: [
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q2_K.gguf",
            label: "llama-2-7b-chat.Q2",
            hint: "2.83 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q3_K_M.gguf",
            label: "llama-2-7b-chat.Q3",
            hint: "3.3 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q4_K_M.gguf",
            label: "llama-2-7b-chat.Q4",
            hint: "4.08 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q5_K_M.gguf",
            label: "llama-2-7b-chat.Q5",
            hint: "4.78 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q6_K.gguf",
            label: "llama-2-7b-chat.Q6",
            hint: "5.53 GB",
        },
        {
            value: "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/blob/main/llama-2-7b-chat.Q8_0.gguf",
            label: "llama-2-7b-chat.Q8",
            hint: "7.16 GB",
        },
    ],
}

export async function selectModelUrl(): Promise<string> {
    const modelGroup = await p.group({
        modelName: async () => {
            const [total, available] = await Promise.all([
                totalmem(),
                freemem(),
            ])
            p.note(
                `Larger models generally provides better AI responses. We recommend the size to be at most 1/2 of your systems total RAM
Your system has ${humanFileSize(total)} total RAM and ${humanFileSize(
                    available,
                )} available.
Therefore a model size up to ${humanFileSize(total / 2)} should work for you.`,
                "Picking the right model size",
            )
            await new Promise<void>((res) => setTimeout(res, 2000))
            const value = await p.select<typeof options, ModelValues>({
                message: "Select model:",
                initialValue: Object.keys(options).at(0)! as ModelValues,
                options,
            })

            if (typeof value !== "string") {
                p.cancel("You must select a model.")
                process.exit(0)
            }

            return value
        },
        modelSize: async ({ results: { modelName } }) => {
            const value = await p.select({
                message: `Select model size\n:`,
                options: models[modelName!]!,
            })

            if (typeof value !== "string") {
                p.cancel("You must select a model size.")
                process.exit(0)
            }

            return value
        },
    })

    return modelGroup.modelSize as string
}

export async function downloadModelUrl(modelUrl: string) {
    const spinner = p.spinner()
    spinner.start("Downloading model...")
    await downloadModelToFolder(modelUrl, MODEL_FOLDER_PATH, spinner)
    spinner.stop()
    p.log.success("Model downloaded!")
}

async function downloadModelToFolder(
    url: string,
    folderPath: string,
    s: {
        start: (msg?: string | undefined) => void
        stop: (msg?: string | undefined, code?: number | undefined) => void
        message: (msg?: string | undefined) => void
    },
) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }

    const filepath = path.resolve(folderPath, "./llm.gguf")

    const writeStream = createWriteStream(filepath)
    await pipeline(
        got
            .stream(url, { encoding: "binary" })
            .on("downloadProgress", (progress) => {
                let emoji = ""

                if (progress.percent > 0.9) {
                    emoji = "🥳"
                } else if (progress.percent > 0.8) {
                    emoji = "😃"
                } else if (progress.percent > 0.75) {
                    emoji = "🙂"
                } else if (progress.percent > 0.6) {
                    emoji = "😐"
                } else if (progress.percent > 0.5) {
                    emoji = "😑"
                } else if (progress.percent > 0.4) {
                    emoji = "😴"
                } else if (progress.percent > 0.2) {
                    emoji = "😑"
                } else {
                    emoji = "🙂"
                }

                s.message(
                    `${emoji} Progress: ${humanFileSize(
                        progress.transferred,
                    )}/${humanFileSize(progress.total ?? 0)} (${(
                        progress.percent * 100
                    ).toFixed(1)}%)`,
                )
            }),
        writeStream,
    )
}

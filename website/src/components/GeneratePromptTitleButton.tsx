import { Button } from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import React, { useState } from "react"

interface GeneratePromptTitleButtonProps {
    promptId: string
    onSuccess: () => void
}

export function GeneratePromptTitleButton({
    promptId,
    onSuccess,
}: GeneratePromptTitleButtonProps) {
    const [loading, setLoading] = useState<boolean>(false)

    async function onClick() {
        const url = new URL("/api/generate_title", "http://localhost:3030")
        url.searchParams.set("prompt_id", promptId)
        setLoading(true)
        try {
            const response: Response | "timeout" | Error = await Promise.race([
                fetch(url).catch((e) => e),
                await new Promise<"timeout">((res) =>
                    setTimeout(() => res("timeout"), 10000),
                ),
            ]).catch((e) => e)

            if (response instanceof Error) {
                throw response
            }

            if (response === "timeout") {
                showNotification({
                    color: "red",
                    title: "Failed generate title",
                    message: "Took more than 10 seconds",
                })
                return
            }

            if (response.status !== 200) {
                return showNotification({
                    color: "red",
                    title: "Failed generate title",
                    message: await response.text(),
                })
            }

            showNotification({
                color: "green",
                title: "Generated title",
                message: await response.text(),
            })
            onSuccess()
        } catch (e) {
            if (e instanceof Error) {
                showNotification({
                    color: "red",
                    title: "Failed generate title",
                    message: e.message,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button loading={loading} onClick={onClick}>
            Generate title
        </Button>
    )
}

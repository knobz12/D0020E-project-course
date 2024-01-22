import { trpc } from "@/lib/trpc"
import { ActionIcon } from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import { IconEyeMinus, IconEyePlus } from "@tabler/icons-react"
import React from "react"

interface PublishPromptButtonProps {
    promptId: string
    published: boolean
}

export function PublishPromptButton({
    promptId,
    published,
}: PublishPromptButtonProps) {
    const utils = trpc.useUtils()
    const publishMutation = trpc.prompts.publishPrompt.useMutation({
        onSuccess(data) {
            utils.prompts.getMyPrompts.refetch()
            utils.prompts.getNonAndPinnedPrompts.refetch()
            utils.prompts.getPromptById.refetch()
            if (data.published) {
                showNotification({
                    color: "teal",
                    title: "Prompt public",
                    message:
                        "This prompt is now visible by anyone on this prompts course page.",
                })
            } else {
                showNotification({
                    color: "orange",
                    title: "Prompt privated",
                    message:
                        "This prompt is only visible by you on your profiles prompt page.",
                })
            }
        },
        onError(error) {
            showNotification({
                color: "red",
                title: "Couldn't change",
                message:
                    "This prompt is now visible by anyone on this prompts course page.",
            })
        },
    })
    const Icon = published ? IconEyeMinus : IconEyePlus

    return (
        <ActionIcon
            title={published ? "Unpublish" : "Publish"}
            loading={publishMutation.isLoading}
            color={!published ? "teal" : "orange"}
            onClick={() =>
                publishMutation.mutate({
                    promptId,
                })
            }
        >
            <Icon />
        </ActionIcon>
    )
}

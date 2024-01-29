import { RouterOutput, trpc } from "@/lib/trpc"
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Group,
    Input,
    List,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { GeneratePromptTitleButton } from "./GeneratePromptTitleButton"

type SummaryContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "SUMMARY"
})["content"]

interface SummaryContentProps {
    content: SummaryContent
    title?: string
    editable?: boolean
    promptId?: string
}

export function SummaryContent({
    promptId,
    title,
    content,
    editable = false,
}: SummaryContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)

    if (editing === true && promptId && title !== undefined) {
        return (
            <SummaryEditor
                promptId={promptId}
                title={title}
                content={content}
                editable={editable}
                onCancel={() => setEditing(false)}
                onFinish={() => {
                    router.reload()
                }}
            />
        )
    }

    return (
        <SummaryViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface SummaryViewerProps extends SummaryContentProps {
    onEdit: () => void
}

function SummaryViewer({
    title,
    content,
    editable,
    onEdit,
    promptId,
}: SummaryViewerProps) {
    const router = useRouter()

    const onGenerateSuccess = useCallback(
        async function () {
            await new Promise<void>((res) => setTimeout(res, 2000))
            router.reload()
        },
        [router],
    )

    return (
        <Stack>
            <Stack>
                <Title style={{ flex: 1 }}>{title}</Title>
                <Flex gap="md" w="max-content">
                    <Link
                        className="w-full"
                        href={`/courses/${router.query.course}/quiz/${router.query.quizId}/play`}
                    >
                        <Button w="100%" color="blue" variant="filled">
                            Play
                        </Button>
                    </Link>
                    {promptId && (
                        <GeneratePromptTitleButton
                            onSuccess={onGenerateSuccess}
                            promptId={promptId}
                        />
                    )}
                    {editable && (
                        <Button
                            w="100%"
                            onClick={onEdit}
                            color="teal"
                            variant="filled"
                        >
                            Edit
                        </Button>
                    )}
                </Flex>
            </Stack>
            <Text>{content.text}</Text>
        </Stack>
    )
}

interface SummaryEditorProps extends SummaryContentProps {
    onCancel: () => void
    onFinish: () => void
    title: string
    promptId: string
}

function SummaryEditor({
    promptId,
    title,
    content,
    editable,
    onCancel,
    onFinish,
}: SummaryEditorProps) {
    const { mutate: mutUpdateSummary, isLoading } =
        trpc.prompts.updateSummaryPrompt.useMutation({
            onError(data, variables, context) {
                notifications.show({
                    color: "red",
                    title: "Summary failed to update",
                    message: data.message,
                })
            },
            onSuccess(data, variables, context) {
                notifications.show({
                    color: "teal",
                    title: "Summary updated",
                    message: "Your summary has been updated with the new text.",
                })
                onFinish()
            },
        })
    const [data, setData] = useState<{
        title: string
        content: SummaryContent
    }>({
        title,
        content,
    })

    return (
        <Stack>
            <Flex gap="lg">
                <Input
                    size="xl"
                    defaultValue={title}
                    style={{ flex: 1 }}
                    onChange={(e) => {
                        console.log("Change")
                        const current = data
                        const val = e.currentTarget.value
                        const newContent = {
                            ...current,
                            title: val,
                        }
                        console.log(newContent)

                        setData(newContent)
                    }}
                />
                <Group>
                    <Button
                        onClick={() => {
                            modals.openConfirmModal({
                                title: "Save quiz",
                                children:
                                    "Are you sure you want to save this summary? The previous text will be overwritten.",
                                confirmProps: { color: "teal" },
                                cancelProps: { color: "red" },
                                labels: { cancel: "Cancel", confirm: "Save" },
                                onConfirm() {
                                    mutUpdateSummary({
                                        promptId,
                                        summary: data,
                                    })
                                },
                                onCancel() {},
                            })
                        }}
                        color="teal"
                        variant="filled"
                        loading={isLoading}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={onCancel}
                        color="red"
                        variant="filled"
                        loading={isLoading}
                    >
                        Cancel
                    </Button>
                </Group>
            </Flex>
            <Textarea
                id="assignment"
                defaultValue={content.text}
                onChange={(e) => {
                    const val = e.currentTarget.value
                    setData((current) => ({
                        ...current,
                        content: { text: val },
                    }))
                }}
            />
        </Stack>
    )
}

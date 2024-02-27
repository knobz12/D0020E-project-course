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

type DivideAssignmentContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "DIVIDEASSIGNMENT"
})["content"]

interface DivideAssignmentContentProps {
    content: DivideAssignmentContent
    title?: string
    editable?: boolean
    promptId?: string
}

export function DivideAssignmentContent({
    promptId,
    title,
    content,
    editable = false,
}: DivideAssignmentContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)

    if (editing === true && promptId && title !== undefined) {
        return (
            <DivideAssignmentEditor
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
        <DivideAssignmentViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface DivideAssignmentViewerProps extends DivideAssignmentContentProps {
    onEdit: () => void
}

function DivideAssignmentViewer({
    title,
    content,
    editable,
    onEdit,
    promptId,
}: DivideAssignmentViewerProps) {
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

interface DivideAssignmentEditorProps extends DivideAssignmentContentProps {
    onCancel: () => void
    onFinish: () => void
    title: string
    promptId: string
}

function DivideAssignmentEditor({
    promptId,
    title,
    content,
    editable,
    onCancel,
    onFinish,
}: DivideAssignmentEditorProps) {
    const { mutate: mutUpdateDivideAssignment, isLoading } =
        trpc.prompts.updateDivideAssignmentPrompt.useMutation({
            onError(data, variables, context) {
                notifications.show({
                    color: "red",
                    title: "DivideAssignment failed to update",
                    message: data.message,
                })
            },
            onSuccess(data, variables, context) {
                notifications.show({
                    color: "teal",
                    title: "DivideAssignment updated",
                    message:
                        "Your DivideAssignment has been updated with the new text.",
                })
                onFinish()
            },
        })
    const [data, setData] = useState<{
        title: string
        content: DivideAssignmentContent
    }>({
        title,
        content,
    })

    return (
        <Stack>
            <Flex gap="lg">
                <Input
                    id="divideAssignmentTitle"
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
                                title: "Save assignment",
                                children:
                                    "Are you sure you want to save this divided assignment? The previous text will be overwritten.",
                                confirmProps: { color: "teal" },
                                cancelProps: { color: "red" },
                                labels: { cancel: "Cancel", confirm: "Save" },
                                onConfirm() {
                                    mutUpdateDivideAssignment({
                                        promptId,
                                        divideAssignment: data,
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

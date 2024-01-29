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

type AssignmentContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "ASSIGNMENT"
})["content"]

interface AssignmentContentProps {
    content: AssignmentContent
    title?: string
    editable?: boolean
    promptId?: string
}

export function AssignmentContent({
    promptId,
    title,
    content,
    editable = false,
}: AssignmentContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)

    if (editing === true && promptId && title !== undefined) {
        return (
            <AssignmentEditor
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
        <AssignmentViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface AssignmentViewerProps extends AssignmentContentProps {
    onEdit: () => void
}

function AssignmentViewer({
    title,
    content,
    editable,
    onEdit,
    promptId,
}: AssignmentViewerProps) {
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

interface AssignmentEditorProps extends AssignmentContentProps {
    onCancel: () => void
    onFinish: () => void
    title: string
    promptId: string
}

function AssignmentEditor({
    promptId,
    title,
    content,
    editable,
    onCancel,
    onFinish,
}: AssignmentEditorProps) {
    const { mutate: mutUpdateAssignment, isLoading } =
        trpc.prompts.updateAssignmentPrompt.useMutation({
            onError(data, variables, context) {
                notifications.show({
                    color: "red",
                    title: "Quiz failed to update",
                    message: data.message,
                })
            },
            onSuccess(data, variables, context) {
                notifications.show({
                    color: "teal",
                    title: "Quiz updated",
                    message: "Your quiz has been updated with the new text.",
                })
                onFinish()
            },
        })
    const [data, setData] = useDebouncedState<{
        title: string
        content: AssignmentContent
    }>(
        {
            title,
            content,
        },
        1000,
    )

    // useEffect(
    //     function () {
    //         console.log("Debounced:", data)
    //     },
    //     [data],
    // )

    return (
        <Stack>
            <Flex gap="lg">
                {/* <Title style={{ flex: 1 }}>{title}</Title> */}
                <Input
                    id="assignmentTitle"
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
                                    "Are you sure you want to save this assignment? The previous text will be overwritten.",
                                confirmProps: { color: "teal" },
                                cancelProps: { color: "red" },
                                labels: { cancel: "Cancel", confirm: "Save" },
                                onConfirm() {
                                    mutUpdateAssignment({
                                        promptId,
                                        assignment: data,
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
            <Textarea id="assignment" defaultValue={content.text} />
            {/* {content.questions.map((qst, qstIdx) => (
                <Stack key={qstIdx + qst.question}>
                    <Input
                        key={"question" + qstIdx}
                        id={"question" + qstIdx}
                        defaultValue={qst.question}
                        autoFocus={true}
                    />
                    <List type="ordered" w="100%">
                        {qst.answers.map((answer, ansIdx) => (
                            <List.Item key={qstIdx + answer.text}>
                                <Flex gap="md">
                                    <Input
                                        id={`question${qstIdx}answer${ansIdx}`}
                                        w="512px"
                                        style={{ flex: 1 }}
                                        defaultValue={answer.text}
                                    />
                                    <Checkbox
                                        id={`question${qstIdx}answer${ansIdx}correct`}
                                        label="Correct answer"
                                        defaultChecked={answer.correct}
                                    />
                                </Flex>
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            ))} */}
        </Stack>
    )
}

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
    Title,
} from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { GeneratePromptTitleButton } from "./GeneratePromptTitleButton"

type FlashcardsContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "FLASHCARDS"
})["content"]

interface FlashcardsContentProps {
    content: FlashcardsContent
    promptId?: string
    title?: string
    editable?: boolean
}

export function FlashcardsContent({
    promptId,
    title,
    content,
    editable = false,
}: FlashcardsContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)

    if (editing === true && promptId && title) {
        return (
            <FlashcardsEditor
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
        <FlashcardsViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface FlashcardsViewerProps extends FlashcardsContentProps {
    onEdit: () => void
}

function FlashcardsViewer({
    title,
    content,
    editable,
    onEdit,
    promptId,
}: FlashcardsViewerProps) {
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
                        href={`/course/${router.query.course}/flashcards/${router.query.flashcardsId}/play`}
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
            {content.questions.map((qst, idx) => (
                <Stack key={idx + qst.question}>
                    <Text>{qst.question}</Text>
                    <Text>{qst.answer}</Text>
                </Stack>
            ))}
        </Stack>
    )
}

interface FlashcardsEditorProps extends FlashcardsContentProps {
    onCancel: () => void
    onFinish: () => void
    title: string
    promptId: string
}

function FlashcardsEditor({
    promptId,
    title,
    content,
    editable,
    onCancel,
    onFinish,
}: FlashcardsEditorProps) {
    const { mutate: mutUpdateFlashcards, isLoading } =
        trpc.prompts.updateFlashcardsPrompt.useMutation({
            onError(data, variables, context) {
                notifications.show({
                    color: "red",
                    title: "Flashcards failed to update",
                    message: data.message,
                })
            },
            onSuccess(data, variables, context) {
                notifications.show({
                    color: "teal",
                    title: "Flashcards updated",
                    message:
                        "Your flashcards has been updated with the new text.",
                })
                onFinish()
            },
        })
    const [data, setData] = useDebouncedState<{
        title: string
        content: FlashcardsContent
    }>(
        {
            title,
            content,
        },
        1000,
    )

    function extractFlashcards() {
        const titleEl: HTMLInputElement | null = document.querySelector(
            "input#flashcardsTitle",
        )

        if (!titleEl) {
            throw new Error("Could not find flashcards title element!")
        }

        const titleText = titleEl.value!
        const qstCount = content.questions.length

        const questions: {
            question: string
            answer: string
        }[] = []

        for (let q = 0; q < qstCount; q++) {
            const qstEl: HTMLInputElement | null = document.querySelector(
                `input#question${q}`,
            )

            if (!qstEl) {
                throw new Error(
                    `Could not find flashcards question input ${q}!`,
                )
            }

            const qstValue = qstEl.value!
            let answer: string = ""

            {
                const ansEl: HTMLInputElement | null = document.querySelector(
                    `input#answer${q}`,
                )

                if (!ansEl) {
                    throw new Error(
                        `Could not find answer ${q} for question ${q}!`,
                    )
                }

                const value = ansEl.value!

                answer = value
            }
            questions.push({ question: qstValue, answer })

            // const el.value
        }

        const flashcards = {
            title: titleText,
            questions,
        }
        console.log("Updated flashcards:", flashcards)
        return flashcards
    }

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
                    id="flashcardsTitle"
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
                                title: "Save flashcards",
                                children:
                                    "Are you sure you want to save this flashcards? The previous answers will be overwritten.",
                                confirmProps: { color: "teal" },
                                cancelProps: { color: "red" },
                                labels: { cancel: "Cancel", confirm: "Save" },
                                onConfirm() {
                                    const flashcards = extractFlashcards()
                                    mutUpdateFlashcards({
                                        promptId,
                                        flashcards: {
                                            title: flashcards.title,
                                            content: {
                                                questions: flashcards.questions,
                                            },
                                        },
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
            {content.questions.map((qst, qstIdx) => (
                <Stack key={qstIdx + qst.question}>
                    {/* <Text>{Question}</Text> */}
                    <Text>Question</Text>
                    <Input
                        key={"question" + qstIdx}
                        id={"question" + qstIdx}
                        defaultValue={qst.question}
                        // value={qst.question}
                        autoFocus={true}
                        // onChange={(e) => {
                        //     console.log("Change")
                        //     const val = e.currentTarget.value
                        //     const current = data

                        //     const questions = content.questions
                        //     questions[qstIdx].question = val

                        //     const newContent = {
                        //         ...current,
                        //         ...questions,
                        //     }

                        //     console.log(newContent)
                        //     setData(newContent)
                        // }}
                    />
                    <Text>Answer</Text>
                    <Input
                        key={"answer" + qstIdx}
                        id={"answer" + qstIdx}
                        defaultValue={qst.answer}
                        // value={qst.question}
                        autoFocus={true}
                    />
                </Stack>
            ))}
        </Stack>
    )
}

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
import { useEffect, useState } from "react"

type QuizContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "QUIZ"
})["content"]

interface QuizContentProps {
    promptId: string
    title: string
    content: QuizContent
    editable?: boolean
}

export function QuizContent({
    promptId,
    title,
    content,
    editable = false,
}: QuizContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)

    if (editing) {
        return (
            <QuizEditor
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
        <QuizViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface QuizViewerProps extends QuizContentProps {
    onEdit: () => void
}

function QuizViewer({ title, content, editable, onEdit }: QuizViewerProps) {
    const router = useRouter()
    return (
        <Stack>
            <Flex>
                <Title style={{ flex: 1 }}>{title}</Title>
                {editable && (
                    <Group>
                        <Link
                            href={`/course/${router.query.course}/quiz/${router.query.quizId}/play`}
                        >
                            <Button color="blue" variant="filled">
                                Play
                            </Button>
                        </Link>
                        <Button onClick={onEdit} color="teal" variant="filled">
                            Edit
                        </Button>
                    </Group>
                )}
            </Flex>
            {content.questions.map((qst, idx) => (
                <Stack key={idx + qst.question}>
                    <Text>{qst.question}</Text>
                    <List>
                        {qst.answers.map((answer, idx) => (
                            <List.Item key={idx + answer.text}>
                                <Text
                                    color={answer.correct ? "green" : undefined}
                                >
                                    {answer.text}
                                </Text>
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            ))}
        </Stack>
    )
}

interface QuizEditorProps extends QuizContentProps {
    onCancel: () => void
    onFinish: () => void
}

function QuizEditor({
    promptId,
    title,
    content,
    editable,
    onCancel,
    onFinish,
}: QuizEditorProps) {
    const { mutate: mutUpdateQuiz, isLoading } =
        trpc.prompts.updateQuizPrompt.useMutation({
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
        content: QuizContent
    }>(
        {
            title,
            content,
        },
        1000,
    )

    function extractQuiz() {
        const titleEl: HTMLInputElement | null =
            document.querySelector("input#quizTitle")

        if (!titleEl) {
            throw new Error("Could not find quiz title element!")
        }

        const titleText = titleEl.value!
        const qstCount = content.questions.length

        if (content.questions.at(0)?.answers.length === 0) {
            throw new Error("Question can not have 0 answers")
        }

        const answerCount = content.questions.at(0)!.answers.length

        const questions: {
            question: string
            answers: { text: string; correct: boolean }[]
        }[] = []
        for (let q = 0; q < qstCount; q++) {
            const qstEl: HTMLInputElement | null = document.querySelector(
                `input#question${q}`,
            )

            if (!qstEl) {
                throw new Error(`Could not find quiz question input ${q}!`)
            }

            const qstValue = qstEl.value!
            const answers: { text: string; correct: boolean }[] = []

            for (let a = 0; a < answerCount; a++) {
                const ansEl: HTMLInputElement | null = document.querySelector(
                    `input#question${q}answer${a}`,
                )
                const ansCorrectEl: HTMLInputElement | null =
                    document.querySelector(
                        `input#question${q}answer${a}correct`,
                    )

                if (!ansEl || !ansCorrectEl) {
                    throw new Error(
                        `Could not find answer or correct ${a} for question ${q}!`,
                    )
                }

                const value = ansEl.value!
                const correct = ansCorrectEl.checked!
                console.log(value, correct)
                console.log(ansCorrectEl)

                answers.push({ text: value, correct: Boolean(correct) })
            }
            questions.push({ question: qstValue, answers })

            // const el.value
        }

        const quiz = {
            title: titleText,
            questions,
        }
        console.log("Updated quiz:", quiz)
        return quiz
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
                    id="quizTitle"
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
                                    "Are you sure you want to save this quiz? The previous answers will be overwritten.",
                                confirmProps: { color: "teal" },
                                cancelProps: { color: "red" },
                                labels: { cancel: "Cancel", confirm: "Save" },
                                onConfirm() {
                                    const quiz = extractQuiz()
                                    mutUpdateQuiz({
                                        promptId,
                                        quiz: {
                                            title: quiz.title,
                                            content: {
                                                questions: quiz.questions,
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
                    {/* <Text>{qst.question}</Text> */}
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
            ))}
        </Stack>
    )
}

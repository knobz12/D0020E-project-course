import { Page } from "@/components/Page"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"

interface QuizContentProps {
    content: Prisma.JsonValue
}

function QuizContent({ content }: QuizContentProps) {
    console.log(`cont (${typeof content}):`, content)
    // if (!content || typeof content !== "object" || !("data" in content)) {
    //     return
    // }

    // const json = (content)
    // json["data"]
    const data = JSON.parse(content as string)
    const questions = data["questions"]
    if (!Array.isArray(questions)) {
        return
    }
    const qsts = questions as {
        question: number
        answers: { text: string; correct: "False" | "True" }[]
    }[]
    console.log(questions)
    // const data = content["data"]

    return (
        <Stack>
            {qsts.map((qst, idx) => (
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
    // return <Text>{JSON.stringify(content, undefined, 4)}</Text>
}

export default function QuizPage() {
    const router = useRouter()
    const quiz = trpc.prompts.getQuizPromptById.useQuery({
        id: router.query.quizId! as string,
    })
    console.log(quiz.data)

    return (
        <Page>
            <Container>
                <Title>{quiz.data?.title}</Title>
                {/* <pre>{JSON.stringify(quiz.data, undefined, 4)}</pre> */}
                {quiz.data && <QuizContent content={quiz.data.content} />}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("quizId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const quizId = params.quizId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const quiz = await db.quizPrompt.findUnique({
            where: { id: quizId, course: { id: dbCourse.id } },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!quiz) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                quiz,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

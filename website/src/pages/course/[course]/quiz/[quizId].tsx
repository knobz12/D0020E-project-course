import { Page } from "@/components/Page"
import { db } from "@/lib/database"
import { RouterOutput, trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"

export default function QuizPage() {
    const router = useRouter()
    const quiz = trpc.prompts.getPromptById.useQuery({
        id: router.query.quizId! as string,
    })
    console.log(quiz.data)

    return (
        <Page>
            <Container>
                <Title>{quiz.data?.title}</Title>
                {/* <pre>{JSON.stringify(quiz.data, undefined, 4)}</pre> */}
                {quiz.data?.type === "QUIZ" && (
                    <QuizContent content={quiz.data.content} />
                )}
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

        const quiz = await db.prompt.findUnique({
            where: { id: quizId, course: { id: dbCourse.id }, type: "QUIZ" },
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

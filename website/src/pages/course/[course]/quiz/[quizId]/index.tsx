import { Page } from "@/components/Page"
import { QuizContent } from "@/components/QuizContent"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, Title } from "@mantine/core"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export default function QuizPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const quiz = trpc.prompts.getPromptById.useQuery({
        id: router.query.quizId! as string,
    })

    return (
        <Page>
            <Container>
                {/* <pre>{JSON.stringify(quiz.data, undefined, 4)}</pre> */}
                {quiz.data?.type === "QUIZ" && (
                    <QuizContent
                        promptId={quiz.data.id}
                        title={quiz.data.title}
                        editable={quiz.data.userId === session?.user.userId}
                        content={quiz.data.content}
                    />
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

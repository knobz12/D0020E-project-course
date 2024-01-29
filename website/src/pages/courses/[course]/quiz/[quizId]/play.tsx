import { Page } from "@/components/Page"
import { RouterOutput, trpc } from "@/lib/trpc"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Text } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth/next"
import { useRouter } from "next/router"
import GenerateQuizPage from ".."
import playableQuiz from "../../playableQuiz"

export default function QuizPlay() {
    const router = useRouter()
    const quizQuery = trpc.prompts.getPromptById.useQuery({
        id: router.query.quizId! as string,
    })

    return (
        <Page>
            {quizQuery.data && quizQuery.data.type === "QUIZ" ? (
                <Player data={quizQuery.data} />
            ) : null}
        </Page>
    )
}

function Player({
    data,
}: {
    data: RouterOutput["prompts"]["getPromptById"] & { type: "QUIZ" }
}) {
    const quiz = data.content

    type Content = (RouterOutput["prompts"]["getPromptById"] & {
        type: "QUIZ"
    })["content"]

    return <div>{playableQuiz(quiz)}</div>
   
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        return {
            props: {
                session: await getServerSession(req, res, authOptions),
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

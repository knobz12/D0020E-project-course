import { RouterOutput, trpc } from "@/lib/trpc"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Text } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth/next"
import { useRouter } from "next/router"

export default function QuizPlay() {
    const router = useRouter()
    const quizQuery = trpc.prompts.getPromptById.useQuery({
        id: router.query.quizId! as string,
    })

    return (
        <Text>
            {quizQuery.data && quizQuery.data.type === "QUIZ" ? (
                <Player data={quizQuery.data} />
            ) : null}
        </Text>
    )
}

function Player({
    data,
}: {
    data: RouterOutput["prompts"]["getPromptById"] & { type: "QUIZ" }
}) {
    const quiz = data.content

    return <Text>{JSON.stringify(quiz)}</Text>
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

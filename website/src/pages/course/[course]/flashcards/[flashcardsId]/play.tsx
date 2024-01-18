import { Page } from "@/components/Page"
import { RouterOutput, trpc } from "@/lib/trpc"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { Text } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth/next"
import { useRouter } from "next/router"
import Flashcards from "../../flashcards"
import playableFlashcards from "../../playableFlashcards"

export default function FlashcardsPlay() {
    const router = useRouter()
    const flashcardsQuery = trpc.prompts.getPromptById.useQuery({
        id: router.query.flashcardsId! as string,
    })

    return (
        <Page>
            {flashcardsQuery.data && flashcardsQuery.data.type === "FLASHCARDS" ? (
                <Player data={flashcardsQuery.data} />
            ) : null}
        </Page>
    )
}

function Player({
    data,
}: {
    data: RouterOutput["prompts"]["getPromptById"] & { type: "FLASHCARDS" }
}) {
    const flashcards = data.content

    type Content = (RouterOutput["prompts"]["getPromptById"] & { type: "FLASHCARDS" })["content"]

    return <div>{playableFlashcards(flashcards)}</div>
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

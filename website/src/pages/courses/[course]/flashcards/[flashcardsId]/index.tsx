import { Page } from "@/components/Page"
import { FlashcardsContent } from "@/components/FlashcardsContent"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, Title } from "@mantine/core"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { PromptViewer } from "@/components/PromptViewer"

export default function FlashcardsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const flashcards = trpc.prompts.getPromptById.useQuery({
        id: router.query.flashcardsId! as string,
    })

    return (
        <Page>
            <Container>
                {/* <pre>{JSON.stringify(flashcards.data, undefined, 4)}</pre> */}
                {flashcards.data?.type === "FLASHCARDS" && (
                    <PromptViewer
                        type="FLASHCARDS"
                        promptId={flashcards.data.id}
                        title={flashcards.data.title}
                        editable={
                            flashcards.data.userId === session?.user.userId
                        }
                        content={flashcards.data.content}
                    />
                )}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("flashcardsId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const flashcardsId = params.flashcardsId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const flashcards = await db.prompt.findUnique({
            where: {
                id: flashcardsId,
                course: { id: dbCourse.id },
                type: "FLASHCARDS",
            },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!flashcards) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                flashcards,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

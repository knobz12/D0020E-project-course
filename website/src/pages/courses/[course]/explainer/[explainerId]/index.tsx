import { Page } from "@/components/Page"
import { PromptViewer } from "@/components/PromptViewer"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, Title } from "@mantine/core"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export default function ExplainerPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const explainer = trpc.prompts.getPromptById.useQuery({
        id: router.query.explainerId! as string,
    })

    return (
        <Page>
            <Container>
                {/* <pre>{JSON.stringify(explainer.data, undefined, 4)}</pre> */}
                {explainer.data?.type === "EXPLAINER" && (
                    <PromptViewer
                        type="EXPLAINER"
                        promptId={explainer.data.id}
                        title={explainer.data.title}
                        editable={
                            session?.user.type === "TEACHER" ||
                            explainer.data.userId === session?.user.userId
                        }
                        content={explainer.data.content}
                    />
                )}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("explainerId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const explainerId = params.explainerId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const explainer = await db.prompt.findUnique({
            where: { id: explainerId, course: { id: dbCourse.id }, type: "EXPLAINER" },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!explainer) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                explainer,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

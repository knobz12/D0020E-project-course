import { Page } from "@/components/Page"
import { PromptViewer } from "@/components/PromptViewer"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export default function DivideAssignmentPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const divideAssignment = trpc.prompts.getPromptById.useQuery({
        id: router.query.divideAssignmentId! as string,
    })
    console.log(divideAssignment.data)

    return (
        <Page>
            <Container>
                {divideAssignment.data?.type === "DIVIDEASSIGNMENT" && (
                    <PromptViewer
                        type="DIVIDEASSIGNMENT"
                        promptId={divideAssignment.data.id}
                        title={divideAssignment.data.title}
                        editable={
                            session?.user.type === "TEACHER" ||
                            divideAssignment.data.userId ===
                                session?.user.userId
                        }
                        content={divideAssignment.data.content}
                    />
                )}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (
            !params ||
            !("course" in params) ||
            !("divideAssignmentId" in params)
        ) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const divideAssignmentId = params.divideAssignmentId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const divideAssignment = await db.prompt.findUnique({
            where: {
                id: divideAssignmentId,
                course: { id: dbCourse.id },
                type: "DIVIDEASSIGNMENT",
            },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!divideAssignment) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                quiz: divideAssignment,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

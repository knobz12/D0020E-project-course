import { Page } from "@/components/Page"
import { PromptViewer } from "@/components/PromptViewer"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"

export default function AssignmentPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const assignment = trpc.prompts.getPromptById.useQuery({
        id: router.query.assignmentId! as string,
    })
    console.log(assignment.data)

    return (
        <Page>
            <Container>
                {assignment.data?.type === "ASSIGNMENT" && (
                    <PromptViewer
                        type="ASSIGNMENT"
                        promptId={assignment.data.id}
                        title={assignment.data.title}
                        editable={
                            session?.user.type === "TEACHER" ||
                            assignment.data.userId === session?.user.userId
                        }
                        content={assignment.data.content}
                    />
                )}
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("assignmentId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const assignmentId = params.assignmentId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const assignment = await db.prompt.findUnique({
            where: {
                id: assignmentId,
                course: { id: dbCourse.id },
                type: "ASSIGNMENT",
            },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!assignment) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                quiz: assignment,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

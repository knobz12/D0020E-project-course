import { Page } from "@/components/Page"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"
import { Container, List, Stack, Text, Title } from "@mantine/core"
import type { Prisma } from "@prisma/client"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"

export default function SummaryPage() {
    const router = useRouter()
    const summary = trpc.prompts.getSummaryPromptById.useQuery({
        id: router.query.summaryId! as string,
    })
    console.log(summary.data)

    return (
        <Page>
            <Container>
                <Title>{summary.data?.title}</Title>
                {/* <pre>{JSON.stringify(quiz.data, undefined, 4)}</pre> */}
                <Text>{summary.data?.content}</Text>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    try {
        if (!params || !("course" in params) || !("summaryId" in params)) {
            return {
                notFound: true,
            }
        }

        const course = params.course as string
        const summaryId = params.summaryId as string

        const dbCourse = await db.course.findUnique({
            where: { name: course },
            select: { id: true },
        })

        if (!dbCourse) {
            return {
                notFound: true,
            }
        }

        const summary = await db.summaryPrompt.findUnique({
            where: { id: summaryId, course: { id: dbCourse.id } },
            select: {
                id: true,
                title: true,
                userId: true,
                content: true,
            },
        })

        if (!summary) {
            return {
                notFound: true,
            }
        }

        return {
            props: {
                quiz: summary,
            },
        }
    } catch (e) {
        console.error(e)
        return {
            notFound: true,
        }
    }
}) satisfies GetServerSideProps

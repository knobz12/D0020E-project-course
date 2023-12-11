import React from "react"
import {
    ActionIcon,
    Badge,
    Card,
    Center,
    Container,
    Divider,
    Flex,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import { Page } from "@/components/Page"
import {
    IconQuestionMark,
    Icon,
    IconBook,
    IconCheck,
    IconArrowUp,
    IconArrowDown,
} from "@tabler/icons-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useRouter } from "next/router"
import { db } from "@/lib/database"
import { trpc } from "@/lib/trpc"

type Prompt = { icon: Icon; text: string; link: string }

const promptGroups: { name: string; prompts: Prompt[] }[] = [
    {
        name: "Generative",
        prompts: [
            {
                icon: IconQuestionMark,
                text: "Quiz",
                link: "/quiz",
            },
            {
                icon: IconQuestionMark,
                text: "QuizTest",
                link: "/quiz2",
            },
            {
                icon: IconBook,
                text: "Summary",
                link: "/summary",
            },
            {
                icon: IconCheck,
                text: "Assignment",
                link: "/assignment",
            },
        ],
    },
    {
        name: "Question",
        prompts: [
            {
                icon: IconBook,
                text: "Question",
                link: "/question",
            },
        ],
    },
]

export default function Home({
    prompts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const { mutate: react } = trpc.prompts.react.useMutation({
        onSuccess: router.reload,
    })

    return (
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%" spacing="xl">
                        <Stack>
                            <Title>Prompts</Title>
                            <Paper px="xl" py="lg">
                                <Stack spacing="xl">
                                    {promptGroups.map((group) => (
                                        <Stack key={group.name}>
                                            <Title>{group.name}</Title>
                                            <SimpleGrid cols={3}>
                                                {group.prompts.map((prompt) => {
                                                    const Icon = prompt.icon
                                                    return (
                                                        <Link
                                                            key={
                                                                prompt.text +
                                                                prompt.link
                                                            }
                                                            href={`${router.asPath}${prompt.link}`}
                                                        >
                                                            <Card>
                                                                <Icon
                                                                    size={48}
                                                                />
                                                                <Text
                                                                    size="lg"
                                                                    fw={600}
                                                                >
                                                                    {
                                                                        prompt.text
                                                                    }
                                                                </Text>
                                                            </Card>
                                                        </Link>
                                                    )
                                                })}
                                            </SimpleGrid>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Paper>
                        </Stack>
                        <Stack>
                            <Title>Prompts</Title>
                            <Stack>
                                {prompts.map((prompt, idx) => {
                                    return (
                                        <Paper
                                            key={prompt.id}
                                            className="overflow-hidden max-h-48"
                                            radius="lg"
                                            p="lg"
                                        >
                                            <Flex gap="md">
                                                <Stack
                                                    align="center"
                                                    spacing="xs"
                                                >
                                                    <ActionIcon
                                                        onClick={() =>
                                                            react({
                                                                positive: true,
                                                                promptId:
                                                                    prompt.id,
                                                                type: prompt.type,
                                                            })
                                                        }
                                                    >
                                                        <IconArrowUp />
                                                    </ActionIcon>
                                                    <Text size="xl">
                                                        {prompt.score}
                                                    </Text>
                                                    <ActionIcon
                                                        onClick={() =>
                                                            react({
                                                                positive: false,
                                                                promptId:
                                                                    prompt.id,
                                                                type: prompt.type,
                                                            })
                                                        }
                                                    >
                                                        <IconArrowDown />
                                                    </ActionIcon>
                                                </Stack>
                                                <Divider orientation="vertical" />
                                                <Flex align="center" gap="md">
                                                    <Title>
                                                        {prompt.title}
                                                    </Title>
                                                    <Badge size="lg">
                                                        {prompt.type}
                                                    </Badge>
                                                </Flex>
                                            </Flex>
                                        </Paper>
                                    )
                                })}
                            </Stack>
                        </Stack>
                    </Stack>
                </Center>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    const course = params?.course
    console.log("Params:", params)

    if (typeof course !== "string") {
        return { notFound: true }
    }

    async function getQuizes() {
        const quizes = await db.quizPrompt.findMany({
            orderBy: { createdAt: "desc" },
            take: 25,
            where: { course: { name: course as string } },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        })

        const formatted = await Promise.all(
            quizes.map(
                (quiz) =>
                    new Promise<
                        Omit<typeof quiz, "createdAt"> & {
                            createdAt: string
                            score: number
                            type: "QUIZ" | "SUMMARY"
                        }
                    >(async (res) => {
                        const [positiveReactions, negativeReactions] =
                            await Promise.all([
                                db.quizPromptReaction.count({
                                    where: {
                                        quizPromptId: quiz.id,
                                        positive: true,
                                    },
                                }),
                                db.quizPromptReaction.count({
                                    where: {
                                        quizPromptId: quiz.id,
                                        positive: false,
                                    },
                                }),
                            ])

                        const score = positiveReactions - negativeReactions

                        res({
                            ...quiz,
                            createdAt: quiz.createdAt.toISOString(),
                            type: "QUIZ",
                            score,
                        })
                    }),
            ),
        )

        return formatted
    }

    async function getSummaries() {
        const summaries = await db.summaryPrompt.findMany({
            orderBy: { createdAt: "desc" },
            take: 25,
            where: { course: { name: course as string } },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        })

        const formatted = await Promise.all(
            summaries.map(
                (summary) =>
                    new Promise<
                        Omit<typeof summary, "createdAt"> & {
                            createdAt: string
                            score: number
                            type: "QUIZ" | "SUMMARY"
                        }
                    >(async (res) => {
                        const [positiveReactions, negativeReactions] =
                            await Promise.all([
                                db.summaryPromptReaction.count({
                                    where: {
                                        summaryPromptId: summary.id,
                                        positive: true,
                                    },
                                }),
                                db.summaryPromptReaction.count({
                                    where: {
                                        summaryPromptId: summary.id,
                                        positive: false,
                                    },
                                }),
                            ])

                        const score = positiveReactions - negativeReactions

                        res({
                            ...summary,
                            createdAt: summary.createdAt.toISOString(),
                            type: "SUMMARY",
                            score,
                        })
                    }),
            ),
        )

        return formatted
    }

    const [session, quizes, summaries] = await Promise.all([
        getServerSession(req, res, authOptions),
        getQuizes(),
        getSummaries(),
    ])

    // Combine into one list ordered by created at date
    const prompts = [...quizes, ...summaries].sort((a, b) =>
        new Date(a.createdAt).valueOf() < new Date(b.createdAt).valueOf()
            ? 1
            : -1,
    )

    return {
        props: {
            prompts,
        },
    }
}) satisfies GetServerSideProps

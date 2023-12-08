import React from "react"
import {
    Badge,
    Box,
    Card,
    Center,
    Container,
    Flex,
    List,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
} from "@mantine/core"
import { Page } from "@/components/Page"
import { modals } from "@mantine/modals"
import {
    IconQuestionMark,
    Icon,
    IconBook,
    IconCheck,
} from "@tabler/icons-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import {
    GetServerSideProps,
    GetStaticPaths,
    InferGetServerSidePropsType,
} from "next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useRouter } from "next/router"
import { db } from "@/lib/database"

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
    quizes,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()

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
                                {quizes.map((quiz, idx) => {
                                    return (
                                        <Paper
                                            onClick={() => {
                                                modals.open({
                                                    title: `Title ${idx + 1}`,
                                                    children: (
                                                        <Text>{quiz.text}</Text>
                                                    ),
                                                })
                                            }}
                                            key={quiz.id}
                                            className="overflow-hidden max-h-48"
                                            radius="lg"
                                            p="lg"
                                        >
                                            <Flex align="center" gap="md">
                                                <Title>Title {idx + 1}</Title>
                                                <Badge size="lg">QUIZ</Badge>
                                            </Flex>
                                            <pre className="w-full h-full overflow-ellipsis">
                                                {quiz.text}
                                            </pre>
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

    if (course !== "D7032E") {
        return { notFound: true }
    }

    const [session, quizes] = await Promise.all([
        getServerSession(req, res, authOptions),
        db.quiz.findMany({
            orderBy: { id: "desc" },
        }),
    ])

    return {
        props: {
            session,
            quizes,
        },
    }
}) satisfies GetServerSideProps

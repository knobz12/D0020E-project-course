import React from "react"
import {
    Box,
    Card,
    Center,
    Container,
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
} from "@tabler/icons-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { GetServerSideProps, GetStaticPaths } from "next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useRouter } from "next/router"

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

export default function Home() {
    const router = useRouter()
    console.log(router)

    return (
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%">
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
                                                            <Icon size={48} />
                                                            <Text
                                                                size="lg"
                                                                fw={600}
                                                            >
                                                                {prompt.text}
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
                </Center>
            </Container>
        </Page>
    )
}

export const getServerSideProps: GetServerSideProps = async ({
    req,
    res,
    params,
}) => {
    const course = params?.course
    console.log("Params:", params)

    if (course !== "D7032E") {
        return { notFound: true }
    }

    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}

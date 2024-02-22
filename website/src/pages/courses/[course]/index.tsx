import React, { createContext, useState } from "react"
import {
    Box,
    Card,
    Center,
    Container,
    Pagination,
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
    IconBrandMastercard,
    IconBoxMultiple,
    IconClipboardList,
    IconMessageQuestion,
    IconPaperclip
} from "@tabler/icons-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useRouter } from "next/router"
import { trpc } from "@/lib/trpc"
import { AnimatePresence, motion } from "framer-motion"
import { PromptItem } from "@/components/PromptItem"

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
                icon: IconBoxMultiple,
                text: "Flashcards",
                link: "/flashcards",
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
            {
                icon: IconPaperclip,
                text: "DivideAssignment",
                link: "/divideAssignment",
            },
             {
                icon: IconClipboardList,
                text: "Explainer",
                link: "/explainer",
            }, 
        ],
    },
     {
        name: "Question",
        prompts: [
            {
                icon: IconMessageQuestion,
                text: "Question",
                link: "/question",
            },
        ],
    }, 
]

export const PaginationContext = createContext<number>(1)

export default function Home({} // prompts,
: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const [page, setPage] = useState<number>(1)
    const prompts = trpc.prompts.getNonAndPinnedPrompts.useQuery({
        course: router.query.course as string,
        page,
    })

    return (
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%" spacing="xl">
                        <Stack>
                            <Title px="md">Create prompts</Title>
                            <Paper px="xl" py="lg" radius="lg">
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
                                                            className="no-underline"
                                                        >
                                                            <Card>
                                                                <Icon
                                                                    color="white"
                                                                    size={48}
                                                                />
                                                                <Text
                                                                    color="gray.3"
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
                            <Title px="md">Prompts</Title>
                            <Stack>
                                <PaginationContext.Provider value={page}>
                                    <AnimatePresence>
                                        {prompts.data?.pinned.map((prompt) => {
                                            return (
                                                <motion.div
                                                    layout
                                                    key={prompt.id}
                                                >
                                                    <PromptItem
                                                        prompt={prompt}
                                                    />
                                                </motion.div>
                                            )
                                        })}
                                        {prompts.data?.prompts.map((prompt) => {
                                            return (
                                                <motion.div
                                                    layout
                                                    key={prompt.id}
                                                >
                                                    <PromptItem
                                                        prompt={prompt}
                                                    />
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </PaginationContext.Provider>
                            </Stack>
                            <Box pb="xl">
                                <Pagination
                                    value={page}
                                    onChange={setPage}
                                    total={prompts.data?.total ?? 0}
                                />
                            </Box>
                        </Stack>
                    </Stack>
                </Center>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res, params }) => {
    const course = params?.course

    if (typeof course !== "string") {
        return { notFound: true }
    }

    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

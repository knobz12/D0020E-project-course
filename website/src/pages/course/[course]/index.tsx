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
    IconTrash,
} from "@tabler/icons-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { authOptions } from "../../api/auth/[...nextauth]"
import { useRouter } from "next/router"
import { trpc } from "@/lib/trpc"
import { useSession } from "next-auth/react"
import { modals } from "@mantine/modals"
import { CreateTeacherNoteButton } from "@/components/CreateTeacherNoteButton"
import { TeacherNote } from "@/components/TeacherNote"

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

export default function Home({} // prompts,
: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const session = useSession()
    const prompts = trpc.prompts.getPrompts.useQuery({
        course: router.query.course as string,
    })
    const { mutate: react } = trpc.prompts.react.useMutation({
        onSuccess() {
            prompts.refetch()
        },
    })
    const { mutate: deletePrompt } = trpc.prompts.deletePromptById.useMutation({
        onSuccess() {
            prompts.refetch()
        },
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
                                {prompts.data?.map((prompt, idx) => {
                                    return (
                                        <Paper
                                            key={prompt.id}
                                            className="overflow-hidden"
                                            radius="lg"
                                            p="lg"
                                        >
                                            <Flex gap="md">
                                                <Stack
                                                    align="center"
                                                    spacing="sm"
                                                >
                                                    <ActionIcon
                                                        variant={
                                                            prompt.reaction ===
                                                            true
                                                                ? "light"
                                                                : undefined
                                                        }
                                                        color={
                                                            prompt.reaction ===
                                                            true
                                                                ? "green"
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            react({
                                                                positive: true,
                                                                promptId:
                                                                    prompt.id,
                                                                type: prompt.type,
                                                            })
                                                        }
                                                    >
                                                        <IconArrowUp
                                                            size={48}
                                                            stroke={
                                                                prompt.reaction ===
                                                                true
                                                                    ? 3
                                                                    : 2
                                                            }
                                                        />
                                                    </ActionIcon>
                                                    <Text size="xl" fw={500}>
                                                        {prompt.score}
                                                    </Text>
                                                    <ActionIcon
                                                        variant={
                                                            prompt.reaction ===
                                                            false
                                                                ? "light"
                                                                : undefined
                                                        }
                                                        color={
                                                            prompt.reaction ===
                                                            false
                                                                ? "red"
                                                                : undefined
                                                        }
                                                        onClick={() =>
                                                            react({
                                                                positive: false,
                                                                promptId:
                                                                    prompt.id,
                                                                type: prompt.type,
                                                            })
                                                        }
                                                    >
                                                        <IconArrowDown
                                                            size={48}
                                                            stroke={
                                                                prompt.reaction ===
                                                                false
                                                                    ? 3
                                                                    : 2
                                                            }
                                                        />
                                                    </ActionIcon>
                                                </Stack>

                                                <Divider orientation="vertical" />

                                                <Flex w="100%">
                                                    <Stack
                                                        align="start"
                                                        style={{ flex: 1 }}
                                                    >
                                                        <Link
                                                            href={`/course/${
                                                                router.query
                                                                    .course
                                                            }/${
                                                                prompt.type ===
                                                                "QUIZ"
                                                                    ? "quiz"
                                                                    : "summary"
                                                            }/${prompt.id}`}
                                                        >
                                                            <Title
                                                                lineClamp={3}
                                                            >
                                                                {prompt.title}
                                                            </Title>
                                                        </Link>
                                                        <Badge size="lg">
                                                            {prompt.type}
                                                        </Badge>
                                                        {prompt.teacherNote && (
                                                            <TeacherNote
                                                                promptId={
                                                                    prompt.id
                                                                }
                                                                note={
                                                                    prompt.teacherNote
                                                                }
                                                            />
                                                        )}
                                                    </Stack>
                                                    <Stack>
                                                        {session.data?.user
                                                            .type ===
                                                            "TEACHER" ||
                                                        prompt.userId ===
                                                            session.data?.user
                                                                ?.userId ? (
                                                            <ActionIcon
                                                                color="red"
                                                                title="Delete prompt"
                                                                onClick={() =>
                                                                    modals.openConfirmModal(
                                                                        {
                                                                            title: "Delete prompt",
                                                                            children:
                                                                                "Are you sure you want to delete this prompt?",
                                                                            color: "red",
                                                                            centered:
                                                                                true,
                                                                            labels: {
                                                                                confirm:
                                                                                    "Delete",
                                                                                cancel: "Cancel",
                                                                            },
                                                                            confirmProps:
                                                                                {
                                                                                    color: "red",
                                                                                },
                                                                            onConfirm:
                                                                                () =>
                                                                                    deletePrompt(
                                                                                        {
                                                                                            id: prompt.id,
                                                                                        },
                                                                                    ),
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                <IconTrash />
                                                            </ActionIcon>
                                                        ) : null}
                                                        {prompt.teacherNote ===
                                                            undefined &&
                                                        session.data?.user
                                                            .type ===
                                                            "TEACHER" ? (
                                                            <CreateTeacherNoteButton
                                                                promptId={
                                                                    prompt.id
                                                                }
                                                            />
                                                        ) : null}
                                                    </Stack>
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

    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

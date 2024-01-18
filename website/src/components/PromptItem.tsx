import {
    Paper,
    Flex,
    Stack,
    ActionIcon,
    Divider,
    Title,
    Badge,
    Text,
    Box,
} from "@mantine/core"
import { modals } from "@mantine/modals"
import {
    IconArrowUp,
    IconArrowDown,
    IconTrash,
    IconPin,
    IconPinFilled,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useContext } from "react"
import { CreateTeacherNoteButton } from "./CreateTeacherNoteButton"
import { TeacherNote } from "./TeacherNote"
import { RouterOutput, trpc } from "@/lib/trpc"
import { useSession } from "next-auth/react"
import { showNotification } from "@mantine/notifications"
import Summary from "@/pages/course/[course]/summary"
import { PaginationContext } from "@/pages/course/[course]"

interface PromptItemProps {
    prompt: RouterOutput["prompts"]["getPromptById"]
}

export function PromptItem({ prompt }: PromptItemProps) {
    const session = useSession()
    const utils = trpc.useUtils()
    const router = useRouter()
    const course = router.query.course
    const page = useContext(PaginationContext)
    const { mutate: react } = trpc.prompts.react.useMutation({
        onSuccess() {
            if (typeof course === "string") {
                utils.prompts.getNonAndPinnedPrompts.refetch({ course, page })
            }
        },
    })
    const { mutate: deletePrompt } = trpc.prompts.deletePromptById.useMutation({
        onSuccess() {
            if (typeof course === "string") {
                utils.prompts.getNonAndPinnedPrompts.refetch({ course, page })
            }
        },
    })
    const { mutate: togglePin } = trpc.prompts.togglePromptPin.useMutation({
        onSuccess() {
            if (typeof course === "string") {
                utils.prompts.getNonAndPinnedPrompts.refetch({ course, page })
            }
        },
        onError: (e) =>
            showNotification({
                color: "red",
                title: "Couldn't pin prompt",
                message: e.message,
            }),
    })

    return (
        <Paper key={prompt.id} className="overflow-hidden" radius="lg" p="lg">
            <Flex gap="md">
                <Stack>
                    {session.data?.user.type === "TEACHER" ? (
                        <ActionIcon
                            color="indigo"
                            onClick={() => togglePin({ promptId: prompt.id })}
                            opacity={prompt.pinned ? 1 : 0.6}
                        >
                            {prompt.pinned ? <IconPinFilled /> : <IconPin />}
                        </ActionIcon>
                    ) : prompt.pinned ? (
                        <Box
                            sx={(theme) => ({ color: theme.colors.indigo[2] })}
                        >
                            <IconPinFilled />
                        </Box>
                    ) : null}
                    <Stack align="center" spacing="sm">
                        <ActionIcon
                            variant={
                                prompt.reaction === true ? "light" : undefined
                            }
                            color={
                                prompt.reaction === true ? "green" : undefined
                            }
                            onClick={() =>
                                react({
                                    positive: true,
                                    promptId: prompt.id,
                                    type: prompt.type,
                                })
                            }
                        >
                            <IconArrowUp
                                size={48}
                                stroke={prompt.reaction === true ? 3 : 2}
                            />
                        </ActionIcon>
                        <Text size="xl" fw={500}>
                            {prompt.score}
                        </Text>
                        <ActionIcon
                            variant={
                                prompt.reaction === false ? "light" : undefined
                            }
                            color={
                                prompt.reaction === false ? "red" : undefined
                            }
                            onClick={() =>
                                react({
                                    positive: false,
                                    promptId: prompt.id,
                                    type: prompt.type,
                                })
                            }
                        >
                            <IconArrowDown
                                size={48}
                                stroke={prompt.reaction === false ? 3 : 2}
                            />
                        </ActionIcon>
                    </Stack>
                </Stack>

                <Divider orientation="vertical" />

                <Flex w="100%">
                    <Stack align="start" style={{ flex: 1 }}>
                        <Link
                            href={`/course/${router.query.course}/${
                                prompt.type === "QUIZ"
                                    ? "quiz"
                                    : prompt.type === "FLASHCARDS"
                                      ? "flashcards"
                                      : prompt.type === "SUMMARY"
                                        ? "summary"
                                        : "assignment"
                            }/${prompt.id}`}
                        >
                            <Title lineClamp={3}>{prompt.title}</Title>
                        </Link>
                        <Badge size="lg">{prompt.type}</Badge>
                        {prompt.teacherNote && (
                            <TeacherNote
                                promptId={prompt.id}
                                note={prompt.teacherNote}
                            />
                        )}
                    </Stack>
                    <Stack>
                        {session.data?.user.type === "TEACHER" ||
                        prompt.userId === session.data?.user?.userId ? (
                            <ActionIcon
                                color="red"
                                title="Delete prompt"
                                onClick={() =>
                                    modals.openConfirmModal({
                                        title: "Delete prompt",
                                        children:
                                            "Are you sure you want to delete this prompt?",
                                        color: "red",
                                        centered: true,
                                        labels: {
                                            confirm: "Delete",
                                            cancel: "Cancel",
                                        },
                                        confirmProps: {
                                            color: "red",
                                        },
                                        onConfirm: () =>
                                            deletePrompt({
                                                id: prompt.id,
                                            }),
                                    })
                                }
                            >
                                <IconTrash />
                            </ActionIcon>
                        ) : null}
                        {prompt.teacherNote === undefined &&
                        session.data?.user.type === "TEACHER" ? (
                            <CreateTeacherNoteButton promptId={prompt.id} />
                        ) : null}
                    </Stack>
                </Flex>
            </Flex>
        </Paper>
    )
}

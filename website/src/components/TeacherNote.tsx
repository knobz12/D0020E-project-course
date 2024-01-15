import { RouterOutput, trpc } from "@/lib/trpc"
import { ActionIcon, Alert, Box, Flex, Space, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { showNotification } from "@mantine/notifications"
import { IconNote, IconTrash } from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/router"
import React from "react"

interface TeacherNoteProps {
    promptId: string
    note: NonNullable<RouterOutput["prompts"]["getPromptById"]["teacherNote"]>
}

export function TeacherNote({ promptId, note }: TeacherNoteProps) {
    const utils = trpc.useUtils()
    const router = useRouter()
    const { mutate: deleteNote } = trpc.prompts.deleteTeacherNote.useMutation({
        async onSuccess() {
            showNotification({
                color: "teal",
                title: "Teacher note deleted",
                message: "Successfully deleted teacher note.",
            })

            // Update the local cache to add the teacher note without fetching data again
            const course = router.query.course

            if (!course || typeof course !== "string") {
                return
            }

            // Cancel any current requests so we don't break the update
            await utils.prompts.getNonAndPinnedPrompts.cancel({ course })
            const data = utils.prompts.getNonAndPinnedPrompts.getData({
                course,
            })

            if (!data) {
                return
            }

            const pinnedUpdated = data.pinned.map((prompt) => {
                if (prompt.id !== promptId) {
                    return prompt
                }

                return {
                    ...prompt,
                    teacherNote: undefined,
                }
            })
            const promptsUpdated = data.prompts.map((prompt) => {
                if (prompt.id !== promptId) {
                    return prompt
                }

                return {
                    ...prompt,
                    teacherNote: undefined,
                }
            })
            utils.prompts.getNonAndPinnedPrompts.setData(
                { course },
                { pinned: pinnedUpdated, prompts: promptsUpdated },
            )
        },
    })

    return (
        <Alert color="blue" icon={<IconNote />} w="100%" p="md">
            <Stack>
                <Box>
                    <Flex justify="space-between">
                        <Text opacity={0.75} fz="xs">
                            Teacher note
                        </Text>
                        <ActionIcon
                            onClick={() =>
                                modals.openConfirmModal({
                                    title: (
                                        <Text size="xl" color="white" fw={700}>
                                            Delete teacher note
                                        </Text>
                                    ),
                                    children: (
                                        <Text>
                                            Are you sure you want to delete this
                                            teacher note? This action cannot be
                                            undone.
                                        </Text>
                                    ),

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
                                        deleteNote({
                                            promptId,
                                        }),
                                })
                            }
                        >
                            <IconTrash />
                        </ActionIcon>
                    </Flex>
                    <Text fw={700} fz="lg">
                        {note.title}
                    </Text>
                    <Text>{note.text}</Text>
                </Box>

                {(note.user.name || note.user.image) && (
                    <Flex align="center" gap="xs">
                        {note.user.image && (
                            <Image
                                width={32}
                                height={32}
                                src={note.user.image}
                                alt={`${note.user.name ?? "Teacher"} avatar`}
                            />
                        )}
                        <Text fw={700}>{note.user.name}</Text>
                    </Flex>
                )}
            </Stack>
        </Alert>
    )
}

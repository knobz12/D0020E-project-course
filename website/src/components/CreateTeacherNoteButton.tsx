import { trpc } from "@/lib/trpc"
import {
    ActionIcon,
    Button,
    Group,
    Modal,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPencilPlus } from "@tabler/icons-react"
import { useForm, zodResolver } from "@mantine/form"
import React from "react"
import { z } from "zod"
import { showNotification } from "@mantine/notifications"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"

const formSchema = z.object({
    title: z.string().min(3).max(128),
    text: z.string().min(16).max(4096),
})

interface CreateTeacherNoteButtonProps {
    promptId: string
}

export function CreateTeacherNoteButton({
    promptId,
}: CreateTeacherNoteButtonProps) {
    const [opened, { open, close }] = useDisclosure(false)
    const router = useRouter()
    const utils = trpc.useUtils()
    const user = useSession()
    const form = useForm<(typeof formSchema)["_type"]>({
        validate: zodResolver(formSchema),
        initialValues: {
            title:
                process.env.NODE_ENV === "development"
                    ? "Question 3 is wrong"
                    : "",
            text:
                process.env.NODE_ENV === "development"
                    ? "Note that something inside question 3 is wrong."
                    : "",
        },
    })
    const { mutate, isLoading } = trpc.prompts.createTeacherNote.useMutation({
        onError: (e) =>
            showNotification({
                color: "red",
                title: "Couldn't create note",
                message: e.message,
            }),
        async onSuccess() {
            showNotification({
                color: "green",
                title: "Teacher note",
                message: `Successfully created the teacher note`,
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

            if (!data || !user.data) {
                return
            }

            const { userId, image, name } = user.data.user

            if (!image || !name) {
                return
            }

            const pinnedUpdated = data.pinned.map((prompt) => {
                if (prompt.id !== promptId) {
                    return prompt
                }

                return {
                    ...prompt,
                    teacherNote: {
                        title: form.values.title,
                        text: form.values.text,
                        user: { id: userId, image, name },
                    },
                }
            })
            const promptsUpdated = data.prompts.map((prompt) => {
                if (prompt.id !== promptId) {
                    return prompt
                }

                return {
                    ...prompt,
                    teacherNote: {
                        title: form.values.title,
                        text: form.values.text,
                        user: { id: userId, image, name },
                    },
                }
            })
            utils.prompts.getNonAndPinnedPrompts.setData(
                { course },
                { pinned: pinnedUpdated, prompts: promptsUpdated },
            )
        },
    })

    return (
        <>
            <ActionIcon color="blue" title="Create teacher note" onClick={open}>
                <IconPencilPlus />
            </ActionIcon>
            <Modal
                title={
                    <Text size="xl" color="white" fw={700}>
                        Create teacher note
                    </Text>
                }
                centered
                opened={opened}
                onClose={close}
            >
                <form
                    onSubmit={form.onSubmit((values) =>
                        mutate({
                            promptId,
                            text: values.text,
                            title: values.title,
                        }),
                    )}
                >
                    <Stack>
                        <TextInput
                            label="Title"
                            description="Short title of what the note is about."
                            required
                            {...form.getInputProps("title")}
                        />
                        <Textarea
                            label="Note"
                            description="Descriptive text for what users should note about the prompt."
                            required
                            {...form.getInputProps("text")}
                        />
                        <Group position="right">
                            <Button
                                loading={isLoading}
                                color="red"
                                onClick={close}
                            >
                                Cancel
                            </Button>
                            <Button
                                loading={isLoading}
                                type="submit"
                                color="teal"
                            >
                                Create
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    )
}

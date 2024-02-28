import { Page } from "@/components/Page"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import React, { useState } from "react"
import { authOptions } from "../api/auth/[...nextauth]"
import {
    Anchor,
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    FocusTrap,
    Input,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core"
import { trpc } from "@/lib/trpc"
import { z } from "zod"
import { useForm, zodResolver } from "@mantine/form"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"

const schema = z.object({
    enabled: z.boolean(),
    apiKey: z.string().max(256).nullable(),
})

export default function ProfileSettingsPage() {
    const settingsQuery = trpc.settings.getSettings.useQuery()
    const { mutate: mutateSettings } = trpc.settings.updateSettings.useMutation(
        {
            async onSuccess(data, variables, context) {
                await settingsQuery.refetch()
                notifications.show({
                    color: "green",
                    message: "Settings updated",
                })
            },
        },
    )
    const form = useForm<(typeof schema)["_type"]>({
        validate: zodResolver(schema),
        initialValues: {
            enabled: settingsQuery.data?.enabled ?? false,
            apiKey: settingsQuery.data?.apiKey ?? null,
        },
    })

    return (
        <Page>
            <Container w="100%" size="sm">
                <Stack>
                    <Title px="sm">Settings</Title>
                    <Paper p="lg">
                        <form
                            onSubmit={form.onSubmit((values) =>
                                mutateSettings(values),
                            )}
                        >
                            <Stack>
                                <Flex align="center" gap="sm">
                                    <Box>
                                        <Title order={3}>OpenAI</Title>
                                        <Text
                                            component="p"
                                            color="gray.4"
                                            m={0}
                                            size="sm"
                                        >
                                            If you want to use OpenAI for AI
                                            generation. This applies globally to
                                            all your AI generation prompts.
                                        </Text>
                                    </Box>
                                    {/* <Box sx={{ flexGrow: 1, width: "max-content" }}> */}
                                    <Checkbox
                                        checked={form.values.enabled}
                                        // checked={settingsQuery.data?.enabled}
                                        onChange={(e) =>
                                            form.setFieldValue(
                                                "enabled",
                                                e.currentTarget.checked,
                                            )
                                        }
                                        label="Enable"
                                        size="md"
                                    />
                                    {/* </Box> */}
                                </Flex>
                                <FocusTrap active={form.values.enabled}>
                                    <PasswordInput
                                        maxLength={64}
                                        value={form.values.apiKey ?? ""}
                                        disabled={!form.values.enabled}
                                        onChange={(e) => {
                                            console.log(e.currentTarget.value)
                                            form.setFieldValue(
                                                "apiKey",
                                                e.currentTarget.value,
                                            )
                                        }}
                                        label={<Text>API key</Text>}
                                        description={
                                            <Text color="gray.5">
                                                Key for OpenAI which you can get{" "}
                                                <Anchor
                                                    href="https://platform.openai.com/api-keys"
                                                    target="_blank"
                                                >
                                                    here
                                                </Anchor>
                                                . Your key will never be shown
                                                to anyone other than you.
                                            </Text>
                                        }
                                    />
                                </FocusTrap>
                                <Flex justify="end">
                                    <Button type="submit">Save</Button>
                                </Flex>
                            </Stack>
                        </form>
                    </Paper>
                </Stack>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        return { redirect: { permanent: false, destination: "/courses" } }
    }

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

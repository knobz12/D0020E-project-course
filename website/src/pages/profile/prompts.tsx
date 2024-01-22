import { Page } from "@/components/Page"
import { PromptItem } from "@/components/PromptItem"
import { trpc } from "@/lib/trpc"
import { AnimatePresence, motion } from "framer-motion"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import React from "react"
import { authOptions } from "../api/auth/[...nextauth]"
import { Container, Stack, Title } from "@mantine/core"

interface MyPromptsPageProps {}

export default function MyPromptsPage({}: MyPromptsPageProps) {
    const promptsQuery = trpc.prompts.getMyPrompts.useQuery()

    return (
        <Page>
            <Container w="100%" size="sm">
                <Stack>
                    <Title>Your prompts</Title>
                    <AnimatePresence>
                        {promptsQuery.data?.map((prompt) => {
                            return (
                                <motion.div layout key={prompt.id}>
                                    <PromptItem prompt={prompt} />
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </Stack>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
    const [session] = await Promise.all([
        getServerSession(req, res, authOptions),
    ])

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

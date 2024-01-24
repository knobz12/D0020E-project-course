import { Page } from "@/components/Page"
import { PromptItem } from "@/components/PromptItem"
import { trpc } from "@/lib/trpc"
import { AnimatePresence, motion } from "framer-motion"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import React, { useState } from "react"
import { authOptions } from "../api/auth/[...nextauth]"
import { Container, Stack, Title } from "@mantine/core"
import  SearchBar  from "@/components/Searchbar"

interface MyPromptsPageProps {}

export default function MyPromptsPage({}: MyPromptsPageProps) {
    const [searchValue, setSearchValue] = useState('')
    console.log(searchValue)
    const handleSearch = (searchValue: string ) =>{
        setSearchValue(searchValue)
        console.log(searchValue)
    }
    const promptsQuery = trpc.prompts.getMyPrompts.useQuery({search:searchValue})


    return (
        <Page>
            <Container w="100%" size="sm">
                <Stack>
                    <Title>Your prompts</Title>
                    <SearchBar onSearch={handleSearch}/>
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

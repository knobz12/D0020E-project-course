import { Page } from "@/components/Page"
import { PromptItem } from "@/components/PromptItem"
import { AnimatePresence, motion } from "framer-motion"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import React from "react"
import { Container, Stack, Title } from "@mantine/core"

import { Input,
    TextInput } from '@mantine/core';
import SuperJSON from "superjson"
import { PromptType } from "@prisma/client"
import { RouterOutput, trpc } from "@/lib/trpc"

interface PromptItemProps {
    prompt: RouterOutput["prompts"]["getPromptById"]
}

export default function searchbar({ prompt }: PromptItemProps) {


    return (<div>
        <TextInput placeholder="Search for promts" />
    

    </div>)
}

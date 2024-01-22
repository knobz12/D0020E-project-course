import { Page } from "@/components/Page"
import { Center } from "@mantine/core"
import React from "react"

interface ProfilePageProps {}

export default function ProfilePage({}: ProfilePageProps) {
    return (
        <Page>
            <Center h="100%">
                <img src="https://i.imgur.com/4W68gCL.jpg" width={512} />
            </Center>
        </Page>
    )
}

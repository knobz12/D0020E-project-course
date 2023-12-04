import FileUpload from "@/components/FileUpload"
import React from "react"
import {
    Button,
    Container,
    Group,
    List,
    Stack,
    Text,
    Title,
    rem,
    useMantineTheme,
} from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import { Page } from "@/components/Page"
import { Dropzone } from "@mantine/dropzone"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"

interface FileUploadProps {
    title: string
    apiUrl: string
}

interface QuizProps {}

async function onClick() {
    //maybe generate/import quiz and make it possible to do the quiz
    return showNotification({ color: "green", message: "It just works -a wise man" })
}

export default function Quiz({}: QuizProps) {
    return (
        <>
        <FileUpload
            title="Generate quiz"
            apiUrl="http://localhost:3030/api/quiz"

            
        /> 
        <Page>
            <Container size="xs">
                <Container color="#FF0000" size="xs" w="50%" h="400p">
                
                </Container>
                <Stack w="100%">
                    <Button onClick={onClick}>Generate and do quiz</Button>
                </Stack>
                
            </Container>
        </Page>
        </>
        
        
    )
}

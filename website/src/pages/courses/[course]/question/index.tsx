import { Page } from "@/components/Page"
import { getApiUrlUrl } from "@/utils/getApiUrl"
import {
    Box,
    Card,
    Container,
    Flex,
    Stack,
    Text,
    Textarea,
} from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import Image from "next/image"
import React, { useEffect, useState } from "react"
interface ChatMessageProps {
    user: "AI" | "user"
    message: string
}

export function ChatMessage({ user, message }: ChatMessageProps) {
    return (
        <Card>
            <Flex align="center" gap="lg">
                {user === "AI" ? (
                    <Image
                        src="https://cdn.aistudybuddy.se/logo.png"
                        width={64}
                        height={64}
                        alt="AI Studybuddy"
                    />
                ) : (
                    <Flex justify="center" align="center" w="64px" h="64px">
                        <Text color="white" fw={700} fz={20}>
                            You
                        </Text>
                    </Flex>
                )}
                <Text fz="lg">{message}</Text>
            </Flex>
        </Card>
    )
}

interface GenerateQuestionPageProps {}

export default function GenerateQuestionPage({}: GenerateQuestionPageProps) {
     const [loading, setLoading] = useState<boolean>(false)
    const [height, setHeight] = useState<number>(0)
    const [streaming, setStreaming] = useState<string | null>(null)
    const [messages, setMessages] = useState<
        { message: string; user: "AI" | "user" }[]
    >([])

    useEffect(function () {
        if (typeof window === undefined) {
            return
        }

        function calculate() {
            const header = document
                .getElementsByTagName("header")
                .item(0) as HTMLDivElement
            setHeight(window.innerHeight - header.clientHeight)
        }
        calculate()
        window.addEventListener("resize", calculate, { passive: true })

        return () => window.removeEventListener("resize", calculate)
    }, [])

    async function getAnswer(message: string) {
        try {
            setLoading(true)
            const url = getApiUrlUrl("/api/chat")
            url.searchParams.set("message", message)
            const response = await fetch(url, { method: "POST" })

            // const text = await response.text()

            if (response.status !== 200) {
                return showNotification({
                    color: "red",
                    message: "Failed to chat",
                })
            }

            const reader = response.body?.getReader()

            if (!reader) {
                throw new Error("No reader")
            }

            setStreaming("")
            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                if (value === undefined) {
                    continue
                }

                // console.log(value)
                const str = new TextDecoder().decode(value)
                console.log(str)
                // console.log()
                setStreaming((current) => (current += str))
            }

            setStreaming((streaming) => {
                if (streaming) {
                    setMessages((messages) => [
                        ...messages,
                        {
                            message: streaming,
                            user: "AI",
                        },
                    ])
                }

                return null
            })
        } catch (e) {
            if (e instanceof Error) {
                showNotification({
                    color: "red",
                    title: "Failed to chat",
                    message: e.message,
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Page>
            <Container
                style={{ height: `${height}px` }}
                className="w-full flex flex-col flex-grow"
                size="sm"
            >
                <Stack className="flex-grow h-full" py="md">
                    <div className="flex-grow h-full max-h-full overflow-y-auto">
                        {/* <Stack className="flex-grow flex flex-col-reverse w-full"> */}
                        <div className="flex-col-reverse h-full">
                            <Flex
                                direction="column"
                                justify="end"
                                mih="100%"
                                gap="lg"
                            >
                                {messages.map(({ message, user }, idx) => (
                                                                       <ChatMessage
                                        key={user + idx}
                                        {...{ user, message }}
                                    /> 
                                ))}
                                 {streaming !== null ? (
                                    <ChatMessage
                                        {...{ user: "AI", message: streaming }}
                                    />
                                ) : null}
                            </Flex>
                        </div>
                    </div>
                    <Textarea
                        disabled={loading}
                        onKeyDown={async (e) => {
                            if (e.key !== "Enter") {
                                return
                            }
                            const val = e.currentTarget.value
                            e.preventDefault()
                            if (val === "") {
                                return
                            }
                            e.currentTarget.value = ""
                            setMessages((current) => [
                                ...current,
                                {
                                    message: val,
                                    user: "user"
                                },
                            ])
                            await getAnswer(val)
                        }}
                    />
                </Stack>
            </Container>
        </Page>
    )
}

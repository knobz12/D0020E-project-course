//import FileUpload from "@/components/FileUpload"
//import React from "react"
import React, { useState } from "react"
import { Paper, Text, Button } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"
import { RouterOutput } from "@/lib/trpc"

type Content = (RouterOutput["prompts"]["getPromptById"] & {
    type: "FLASHCARDS"
})["content"]

export default function Flashcards({
    flashcardQuestions,
}: {
    flashcardQuestions: Content
}) {
    let [data] = useState<Content>(flashcardQuestions)
    let [current, setCurrent] = useState(0)
    let [flipped, setFlipped] = useState(false)

    function previousCard() {
        setCurrent(current - 1)
        setFlipped(false)
    }
    function nextCard() {
        setCurrent(current + 1)
        setFlipped(false)
    }

    function toggleFlipped() {
        setFlipped(!flipped)
    }

    return (
        <div className="grid h-full min-h-screen place-items-center">
            <div className="space-y-4">
                {/* number of cards */}
                {data && data.questions.length > 0 ? (
                    <Text fw={700} fz={24} className="cardNumber text-center">
                        Card {current + 1} of {data.questions.length}
                    </Text>
                ) : null}

                <div className="card">
                    <div
                        onClick={toggleFlipped}
                        style={{
                            transform: flipped
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
                        }}
                        className="card_inner"
                    >
                        <Paper className="card_front grid h-full place-items-center">
                            <Text className="absolute left-0 top-0 ml-3 mt-2 text-sm opacity-50">
                                Question
                            </Text>
                            <Text fw={500} fz={20}>
                                {data && data.questions.length > 0
                                    ? data.questions[current].question
                                    : ""}
                            </Text>
                        </Paper>
                        <Paper
                            bg="blue.9"
                            className="card_back grid h-full place-items-center"
                        >
                            <Text className="absolute left-0 top-0 ml-3 mt-2 text-sm opacity-60">
                                Answer
                            </Text>
                            <Text fw={500} fz={20}>
                                {data && data.questions.length > 0
                                    ? data.questions[current].answer
                                    : ""}
                            </Text>
                        </Paper>
                        {/* <div className="card_front">
                            {data && data.questions.length > 0
                                ? data.questions[current].question
                                : ""}
                        </div> */}
                        {/* <div className="card_back">
                            {data && data.questions.length > 0
                                ? data.questions[current].answer
                                : ""}
                        </div> */}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button
                        color="red"
                        disabled={current <= 0}
                        onClick={previousCard}
                    >
                        Previous
                    </Button>
                    <Button
                        color="green"
                        disabled={data && current >= data.questions.length - 1}
                        onClick={nextCard}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}

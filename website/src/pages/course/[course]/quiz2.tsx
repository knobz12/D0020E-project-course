//import FileUpload from "@/components/FileUpload"
//import React from "react"
import React, { useState } from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

//insperation 👌 https://www.geeksforgeeks.org/how-to-build-a-quiz-app-with-react-and-typescript/

const questions = [
    {
        question: "What is the capital of France?",
        choices: ["Paris", "London", "New York", "bollar"],
        CorrectAnswer: "Paris",
    },
    {
        question: "What is the largest planet in our solar system?",
        choices: ["Mars", "Jupiter", "Venus"],
        CorrectAnswer: "Jupiter",
    },
    {
        question: "What is the boiling point of water?",
        choices: ["100°C", "0°C", "50°C"],
        CorrectAnswer: "100°C",
    },
    {
        question: "What is the largest planet in our solar system?",
        choices: ["Mars", "Jupiter", "Venus"],
        CorrectAnswer: "Jupiter",
    },
    {
        question: "What is the boiling point of water?",
        choices: ["100°C", "0°C", "50°C,"],
        CorrectAnswer: "100°C",
    },
]

interface Props {
    question: string
    choices: string[]
    CorrectAnswer: string
    onAnswer: (CorrectAnswer: string) => void
}

const Question: React.FC<Props> = ({
    question,
    choices,
    CorrectAnswer,
    onAnswer,
}) => {
    return (
        <div
            className="d-flex 
                        justify-content-center 
                        align-center 
                        text-center 
                        flex-column"
        >
            <h2 className="">{question}</h2>
            <div className="">
                {choices.map((choice) => (
                    <button
                        key={choice}
                        className="btn btn-success m-2"
                        onClick={() => onAnswer(choice)}
                    >
                        {choice}
                    </button>
                ))}
                {/*<button className="btn btn-success m-2">Reset{}</button>*/}
            </div>
        </div>
    )
}

const Quiz: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)

    const handleAnswer = (CorrectAnswer: string) => {
        if (CorrectAnswer === questions[currentQuestion].CorrectAnswer) {
            setScore(score + 1)
        } else {
            alert(`Wrong 🤢`)
        }

        const nextQuestion = currentQuestion + 1
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion)
        } else {
            alert(`Quiz finished. You scored ${score}/${questions.length}`)
        }
    }

    return (
        <div>
            <h1 className="text-center">Quiz</h1>
            {currentQuestion < questions.length ? (
                <Question
                    question={questions[currentQuestion].question}
                    choices={questions[currentQuestion].choices}
                    CorrectAnswer={questions[currentQuestion].CorrectAnswer}
                    onAnswer={handleAnswer}
                />
            ) : (
                "null"
            )}
        </div>
    )
}

export default function QuizSite() {
    return (
        <>
            <FileUpload
                title="Generate quiz"
                apiUrl="http://localhost:3030/api/quiz"
            />

            <div className="">
                <Quiz />
            </div>
        </>
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

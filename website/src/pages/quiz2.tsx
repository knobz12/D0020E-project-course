//import FileUpload from "@/components/FileUpload"
//import React from "react"
import React, { useState, useRef } from 'react';
import FileUpload from "@/components/FileUpload"
import { sleep } from 'openai/core.mjs';



import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]"

//insperation 👌 https://www.geeksforgeeks.org/how-to-build-a-quiz-app-with-react-and-typescript/





const questions = [
    {
        question: "What is the boiling point of water? answer  1 or 2",
        choices: ["100°C", "1°C", "2°C"],
        CorrectAnswer: ["1°C","2°C"],
    },
    {
        question: 'What is the capital of France?',
        choices: ['Paris', 'London', 'bollar'],
        CorrectAnswer: ['Paris'],
    },
    {
        question: 'What is the largest planet in our solar system?',
        choices: ['Jupiter','Mars',  'Venus'],
        CorrectAnswer: ['Jupiter'],
    },
    {
        question: "What is the boiling point of water?",
        choices: ["100°C", "0°C", "50°C"],
        CorrectAnswer: ["100°C"],
    },
    {
        question: 'What is the largest planet in our solar system?',
        choices: ['Jupiter', 'Mars',  'Venus'],
        CorrectAnswer: ['Jupiter'],
    },
    {
        question: "What is the boiling point of water?",
        choices: ["100°C", "0°C", "50°C,"],
        CorrectAnswer: ["100°C"],
    },
]

interface Props {
    question: string
    choices: string[]
    CorrectAnswer: string[]
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
function CheckCorrectAnswer(answer:string, CorrectAnswer:string[]){
    console.log(CorrectAnswer)
    console.log(answer)
    for(let i = 0; i < CorrectAnswer.length; i++){
        console.log("dm"+i)
        console.log(CorrectAnswer[i]+" and "+ answer)
        if(CorrectAnswer[i] === answer){
            console.log("correct")
            return 1
        }
    }
    console.log("wrong")
    return 0
}

function Quiz(){
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    var TempScore = score;  
    
    const handleAnswer = (CorrectAnswer: string) => {
        if (CheckCorrectAnswer(CorrectAnswer, questions[currentQuestion].CorrectAnswer)===1){
        //if (CorrectAnswer === questions[currentQuestion].CorrectAnswer[0]) {
            console.log(TempScore);
            TempScore = score + 1;
            setScore(TempScore); // this is an asynchronous call so it wont update before score i shown
            console.log(TempScore);
                
        }else{
            alert(`Wrong 🤢`);
        }
 
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {

            alert(`Quiz finished. You scored ${TempScore}/${questions.length}`);
            setScore(0); //reset quiz
            setCurrentQuestion(0);
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
    var test = <FileUpload 
    title=   "Generate quiz"
    apiUrl=  "http://localhost:3030/api/quiz"/>

    

  
    return (
        <>
        {test}
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

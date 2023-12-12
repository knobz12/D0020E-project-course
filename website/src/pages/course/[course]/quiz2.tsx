//import FileUpload from "@/components/FileUpload"
//import React from "react"
import React, { useState, useRef } from 'react';
import FileUpload from "@/components/FileUpload"
import { sleep } from 'openai/core.mjs';


import {
    Card,
    Center,
    Container,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
    Checkbox,
    CheckboxProps,
} from "@mantine/core"
import { IconBiohazard, IconRadioactive } from '@tabler/icons-react';

import { Page } from "@/components/Page"
import Link from "next/link"

import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

//insperation 👌 https://www.geeksforgeeks.org/how-to-build-a-quiz-app-with-react-and-typescript/


const questions = [
    {
        question: "What is the boiling point of water?",
        choices: ["100°C", "1°C", "2°C"],
        CorrectAnswer: ["100°C","1°C"],
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
    onSubmit: (CorrectAnswer: string) => void
}

var tempChoices:string [];


function Demo(choice:string) {
    const [checked, setChecked] = useState(false);
    return (
        <>
        <button
        //onClick={() => onSubmit("0°C")}
        onClick={() => alert("test")}
        >
            {"submit"}
        </button>
        <Checkbox 
            key={choice}
            id={choice}
            size={100}
            radius={10}
            label={choice}
            checked={checked} 
            onChange={(event) => setChecked(event.currentTarget.checked)}
        />
        
        </>
    );
  }


const Question: React.FC<Props> = ({
    question,
    choices,
    CorrectAnswer,
    onAnswer,
    onSubmit,
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

                {/* <button
                //onClick={() => onSubmit("0°C")}
                onClick={() => alert("test")}
                >
                    {"submit"}
                </button>
                {choices.map((choice, idx) => (
                    <Checkbox 
                        key={choice + idx}
                    id={choice}
                    size={100}
                    radius={10}
                    label={choice}
                    checked={checked} 
                    onChange={(event) => setChecked(event.currentTarget.checked)}
                    />
                ))} */}
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
            setScore(0);            //reset quiz
            setCurrentQuestion(0);  //reset quiz
        }
    }

    const handleSubmit = (CorrectAnswer: string) => {
        if (CheckCorrectAnswer(CorrectAnswer, questions[currentQuestion].CorrectAnswer)===1){
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
            setScore(0);            //reset quiz
            setCurrentQuestion(0);  //reset quiz
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
                    onSubmit={handleSubmit}
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
    apiUrl=  "http://localhost:3030/api/quiz"
    />

    

  
    return (
        <>
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%">
                        <Title>Quiz_test</Title>
                        <Paper px="xl" py="lg">
                            <Stack spacing="xl">
                                <Stack>
                                    <SimpleGrid cols={1}>
                                        <div className="">
                                            <Quiz />
                                        </div>
                                    </SimpleGrid>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Center>
            </Container>
        </Page>
            
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

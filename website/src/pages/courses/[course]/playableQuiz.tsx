

import React, { useState, useRef } from 'react';
import FileUpload from "@/components/FileUpload"
import { showNotification } from "@mantine/notifications"


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

import { useRouter } from "next/router"
import { RouterOutput, trpc } from "@/lib/trpc"

//insperation 👌 https://www.geeksforgeeks.org/how-to-build-a-quiz-app-with-react-and-typescript/

type Content = (RouterOutput["prompts"]["getPromptById"] & { type: "QUIZ" })["content"]


interface Props {
    question: string
    choices: string[]
    CorrectAnswer: string[]
    onAnswer: (CorrectAnswer: string) => void
    onSubmit: () => void
}

var tempChoices:string [];


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
            <Container w="70%">
                <Container w="70%">
                     <button
                    onClick={() =>
                        onSubmit()} 
                    >
                        {"submit"}
                    </button>

                    {choices.map((choice) => (
                        <Checkbox  
                        key={choice}
                        id={choice}
                        className={"ChoicesElement"}
                        size={30}
                        radius={5}
                        label={choice}
                        />
                    ))} 
                </Container>


                {choices.map((choice) => (
                    <button
                        key={choice}
                        className="btn btn-success m-2"
                        onClick={() => onAnswer(choice)}
                    >
                        {choice}
                    </button>
                ))}
            </Container>
        </div>
    )
}

function CheckCorrectAnswer(answer:string[], CorrectAnswer:string[]){  // checks if the given answer is in the correct answers

    let score = 0;

    for(let i = 0; i < answer.length; i++){ 
        if(CorrectAnswer.includes(answer[i])){
            score += 1;
        }else{
            score += -1;
        }

    }

    if(score <= 0 ){ score = 0}  // cant get negative points from question

    return (score/CorrectAnswer.length)
}

function extractChoises(Quizquestions:Content,questionID:number){

    if(questionID >= Quizquestions.questions.length){
        return [[],[]]
    }

    var choices:string[] = [];
    var correctChoices:string[] = [];
    var num = questionID;
    
    let y = 0;
    for (let i = 0; i<Quizquestions.questions[questionID].answers.length; i++){
        if(Quizquestions.questions[num].answers[i].correct){  // if correct answer -> add to array
            correctChoices[y] = Quizquestions.questions[num].answers[i].text 
            y++
        }

        choices[i] = Quizquestions.questions[num].answers[i].text
        
    }
    return [choices,correctChoices]
}

export default function Quiz(Quizquestions:Content){

    

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    var TempScore = score;

    let choicesArray = extractChoises(Quizquestions,currentQuestion)
    
   
    const handleAnswer = (ChossenAnswer: string) => {
        console.log(TempScore);
        let tempAnswers = [ChossenAnswer]
        let questionScore = CheckCorrectAnswer(tempAnswers, choicesArray[1]);
        TempScore = score + questionScore;
        setScore(TempScore); // this is an asynchronous call so it wont update before score i shown
        console.log(TempScore);

        let title = ""
        let colour = ""

        if(questionScore == 1){
            title = "very good"
            colour = "green"
        }else if(questionScore>=0.5){
            title = "good"
            colour = "blue"
        }else if(questionScore>0){
            title = "ok"
            colour = "orange"
        }else{
            title = "💀"
            colour = "black"
        }
        showNotification({
            color: colour,
            title: title,
            message: `You got '${questionScore}' points for that question`,
        })
 
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < Quizquestions.questions.length) {
            setCurrentQuestion(nextQuestion);
            //choicesArray = extractChoises(Quizquestions,currentQuestion,Quizquestions.questions.length)
        } else {
            
            choicesArray = [];
            alert(`Quiz finished. You scored ${TempScore}/${Quizquestions.questions.length}`);
            setScore(0);            //reset quiz
            setCurrentQuestion(0);  //reset quiz
        }
    }

     const handleSubmit = () => {
        
        let elements = document.getElementsByClassName("mantine-Checkbox-root ChoicesElement mantine-yxmaw9");
        let ChossenAnswer = []
        for(let i = 0; i< elements.length; i++){
            if((elements[i].children[0].children[0].children[0] as HTMLInputElement).checked == true){
                ChossenAnswer.push(elements[i].children[0].children[1].children[0].innerHTML)
            }
        }

        let questionScore = CheckCorrectAnswer(ChossenAnswer, choicesArray[1]);
        TempScore = score + questionScore;
        setScore(TempScore); // this is an asynchronous call so it wont update before score i shown

        let title = ""
        let colour = ""
                
        if(questionScore == 1){
            title = "very good"
            colour = "green"
        }else if(questionScore>=0.5){
            title = "good"
            colour = "blue"
        }else if(questionScore>0){
            title = "ok"
            colour = "orange"
        }else{
            title = "💀"
            colour = "black"
        }
        showNotification({
            color: colour,
            title: title,
            message: `You got '${questionScore}' points for that question`,
        })
       
 
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < Quizquestions.questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {

            alert(`Quiz finished. You scored ${TempScore}/${Quizquestions.questions.length}`);
            setScore(0);            //reset quiz
            setCurrentQuestion(0);  //reset quiz
        }
    }
        
    
    return (
        <Container w="100%" >
            <h1 className="text-center">Quiz</h1>
            <div className="grid place-items-center h-full">
            {currentQuestion < Quizquestions.questions.length ? (
                <Question
                    question={Quizquestions.questions[currentQuestion].question}
                    choices={choicesArray[0]}
                    CorrectAnswer={choicesArray[1]}   
                    onAnswer={handleAnswer}
                    onSubmit={handleSubmit}
                />
            ) : (
                "null"
            )}
            </div>
        </Container>
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

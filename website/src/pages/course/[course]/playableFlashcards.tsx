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

import { useRouter } from "next/router"
import { RouterOutput, trpc } from "@/lib/trpc"

//insperation 👌 https://www.geeksforgeeks.org/how-to-build-a-flashcards-app-with-react-and-typescript/

type Content = (RouterOutput["prompts"]["getPromptById"] & { type: "FLASHCARDS" })["content"]





export default function Flashcards(Flashcardsquestions:Content){


    let [data] = useState<Content >(Flashcardsquestions)
    let [current, setCurrent] = useState(0)

    function previousCard() {
        setCurrent(current - 1);
    }
    function nextCard() {
        setCurrent(current + 1);
    }


    
    return (
        <div>
        {/* number of cards */}
        {data && data.questions.length > 0 ? (
            <div className="cardNumber">
            Card {current + 1} of {data.questions.length}
            </div>
        ) : (
            ""
        )}
        {/* /number of cards */}

        {/* render cards */}
        {data && data.questions.length > 0 ? data.questions[current].question : ""}
        {data && data.questions.length > 0 ? data.questions[current].answer : ""}
        {/* /render cards */}

        {/* render nav buttons */}
        <div className="nav">
            {current > 0 ? (
            <button onClick={previousCard}>Previous card</button>
            ) : (
            <button className="disabled" disabled>
                Previous card
            </button>
            )}
            {data && current < data.questions.length - 1 ? (
            <button onClick={nextCard}>Next card</button>
            ) : (
            <button className="disabled" disabled>
                Next card
            </button>
            )}
            {/* /render nav buttons */}
        </div>
        </div>
    );
}


 export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
} 

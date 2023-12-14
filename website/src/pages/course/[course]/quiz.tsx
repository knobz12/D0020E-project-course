import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

interface QuizProps {}

export default function Quiz({}: QuizProps) {
    return (
        <FileUpload
            type="QUIZ"
            title="Generate quiz"
            apiUrl="http://localhost:3030/api/quiz"
            parameters={[
                {
                    id: "questions",
                    name: "Questions",
                    placeholder:
                        "The amount of questions you want to generate for the quiz.",
                    type: "number",
                },
            ]}
        />
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

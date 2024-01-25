import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]"
import { getApiUrl } from "@/utils/getApiUrl"

interface GenerateQuizPageProps {}

export default function GenerateQuizPage({}: GenerateQuizPageProps) {
    return (
        <FileUpload
            type="QUIZ"
            title="Generate quiz"
            apiUrl={getApiUrl("/api/quiz")}
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

    if (!session) {
        return {
            redirect: { destination: "/api/auth/signin", permanent: false },
        }
    }

    return {
        props: {
            session,
        },
    }
}

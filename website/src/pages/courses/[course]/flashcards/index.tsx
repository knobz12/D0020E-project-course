import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]"

interface GenerateFlashcardsPageProps {}

export default function GenerateFlashcardsPage({}: GenerateFlashcardsPageProps) {
    return (
        <FileUpload
            type="FLASHCARDS"
            title="Generate flashcards"
            apiUrl="http://localhost:3030/api/flashcards"
            parameters={[
                {
                    id: "questions",
                    name: "Questions",
                    placeholder:
                        "The amount of flashcards you want to generate.",
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

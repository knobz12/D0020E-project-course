import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

interface assignmentProps {}

export default function assignment({}: assignmentProps) {
    return (
        <FileUpload
            type="ASSIGNMENT"
            title="Generate assignment"
            apiUrl="http://localhost:3030/api/assignment"
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

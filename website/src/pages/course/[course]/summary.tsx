import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/[...nextauth]"

interface SummaryProps {}

export default function Summary({}: SummaryProps) {
    return (
        <FileUpload
            title="Generate summary"
            apiUrl="http://localhost:3030/api/summary"
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

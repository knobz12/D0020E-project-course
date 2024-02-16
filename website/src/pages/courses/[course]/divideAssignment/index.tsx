import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]"
import { getApiUrl } from "@/utils/getApiUrl"

interface DivideAssignmentPageProps {}

export default function AssignmentPage({}: DivideAssignmentPageProps) {
    return (
        <FileUpload
            type="DIVIDEASSIGNMENT"
            title="Divide an assignment"
            apiUrl={getApiUrl("/api/divideAssignment")}
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

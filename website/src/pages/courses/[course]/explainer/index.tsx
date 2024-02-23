import React from "react"
import FileUpload from "@/components/FileUpload"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../api/auth/[...nextauth]"
import { Multi } from "@/components/FileUpload"
import { getApiUrl } from "@/utils/getApiUrl"

interface ExplainerProps {}

export default function Explainer({}: ExplainerProps) {
    return (
        <div>
            <FileUpload
                type="EXPLAINER"
                title="Generate explaination"
                apiUrl={getApiUrl("/api/explainer")}
                parameters={[
                    {
                        id: "amount",
                        name: "Amount of keywords per files",
                        placeholder:
                            "The amount of keywords you want to generate",
                        type: "number",
                    },
                    {
                        id: "keywords",
                        name: "Custom Keywords",
                        placeholder: "Additional keywords to explain",
                        type: "Multi",
                    },
                ]}
            />
        </div>
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

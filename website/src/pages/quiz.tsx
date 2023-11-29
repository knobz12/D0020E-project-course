import React from "react"
import FileUpload from "@/components/FileUpload"

interface QuizProps {}

export default function Quiz({}: QuizProps) {
    return (
        <FileUpload
            title="Generate quiz"
            apiUrl="http://localhost:3030/api/quiz"
        />
    )
}

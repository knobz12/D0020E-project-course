import React from "react"
import FileUpload from "@/components/FileUpload"

interface SummaryProps {}

export default function Summary({}: SummaryProps) {
    return (
        <FileUpload
            title="Generate summary"
            apiUrl="http://localhost:3030/api/summary"
        />
    )
}

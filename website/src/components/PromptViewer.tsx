import { RouterOutput } from "@/lib/trpc"
import React from "react"
import { QuizContent } from "./QuizContent"
import { FlashcardsContent } from "./FlashcardsContent"
import { AssignmentContent } from "./AssignmentContent"
import { SummaryContent } from "./SummaryContent"
import { ExplainerContent } from "./ExplainerContent"

type PromptViewerProps = {
    title?: string
    editable?: boolean
    promptId?: string
} & (
    | {
          type: "QUIZ"
          content: (RouterOutput["prompts"]["getPromptById"] & {
              type: "QUIZ"
          })["content"]
      }
    | {
          type: "SUMMARY"
          content: (RouterOutput["prompts"]["getPromptById"] & {
              type: "SUMMARY"
          })["content"]
      }
    | {
          type: "FLASHCARDS"
          content: (RouterOutput["prompts"]["getPromptById"] & {
              type: "FLASHCARDS"
          })["content"]
      }
    | {
          type: "EXPLAINER"
          content: (RouterOutput["prompts"]["getPromptById"] & {
              type: "EXPLAINER"
          })["content"]
      }
    | {
          type: "ASSIGNMENT"
          content: (RouterOutput["prompts"]["getPromptById"] & {
              type: "ASSIGNMENT"
          })["content"]
      }
)

export function PromptViewer({ type, ...props }: PromptViewerProps) {
    switch (type) {
        case "QUIZ":
            return (
                <QuizContent
                    {...(props as PromptViewerProps & { type: "QUIZ" })}
                />
            )
        case "FLASHCARDS":
            return (
                <FlashcardsContent
                    {...(props as PromptViewerProps & { type: "FLASHCARDS" })}
                />
            )
        case "EXPLAINER":
        return (
            <ExplainerContent
                {...(props as PromptViewerProps & { type: "EXPLAINER" })}
            />
        )
        case "ASSIGNMENT":
            return (
                <AssignmentContent
                    {...(props as PromptViewerProps & { type: "ASSIGNMENT" })}
                />
            )
        case "SUMMARY":
            return (
                <SummaryContent
                    {...(props as PromptViewerProps & { type: "SUMMARY" })}
                />
            )
        default:
            return null
    }
}

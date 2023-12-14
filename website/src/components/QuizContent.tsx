import { RouterOutput } from "@/lib/trpc"
import { List, Stack, Text } from "@mantine/core"

interface QuizContentProps {
    content: (RouterOutput["prompts"]["getPromptById"] & {
        type: "QUIZ"
    })["content"]
}

export function QuizContent({ content }: QuizContentProps) {
    console.log("Content:", content)
    return (
        <Stack>
            {content.questions.map((qst, idx) => (
                <Stack key={idx + qst.question}>
                    <Text>{qst.question}</Text>
                    <List>
                        {qst.answers.map((answer, idx) => (
                            <List.Item key={idx + answer.text}>
                                <Text
                                    color={answer.correct ? "green" : undefined}
                                >
                                    {answer.text}
                                </Text>
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            ))}
        </Stack>
    )
}

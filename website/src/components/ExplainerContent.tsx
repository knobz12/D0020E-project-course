import { RouterOutput, trpc } from "@/lib/trpc"
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Group,
    Input,
    List,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import { useDebouncedState } from "@mantine/hooks"
import { modals } from "@mantine/modals"
import { notifications } from "@mantine/notifications"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { GeneratePromptTitleButton } from "./GeneratePromptTitleButton"

type ExplainerContent = (RouterOutput["prompts"]["getPromptById"] & {
    type: "EXPLAINER"
})["content"]

interface ExplainerContentProps {
    content: ExplainerContent
    title?: string
    editable?: boolean
    promptId?: string
}

export function ExplainerContent({
    promptId,
    title,
    content,
    editable = false,
}: ExplainerContentProps) {
    const router = useRouter()
    const [editing, setEditing] = useState<boolean>(false)
    // console.log("Content:", content)



    return (
        <ExplainerViewer
            promptId={promptId}
            title={title}
            content={content}
            editable={editable}
            onEdit={() => setEditing(true)}
        />
    )
}

interface ExplainerViewerProps extends ExplainerContentProps {
    onEdit: () => void
}

function ExplainerViewer({
    title,
    content,
    editable,
    onEdit,
    promptId,
}: ExplainerViewerProps) {
    const router = useRouter()

    const onGenerateSuccess = useCallback(
        async function () {
            await new Promise<void>((res) => setTimeout(res, 2000))
            router.reload()
        },
        [router],
    )

    return (
        <Stack>
            <Stack>
                <Title style={{ flex: 1 }}>{title}</Title>
                <Flex gap="md" w="max-content">
                    <Link
                        className="w-full"
                        href={`/courses/${router.query.course}/Explainer/${router.query.ExplainerId}/play`}
                    >
                        <Button w="100%" color="blue" variant="filled">
                            Play
                        </Button>
                    </Link>
                    {promptId && (
                        <GeneratePromptTitleButton
                            onSuccess={onGenerateSuccess}
                            promptId={promptId}
                        />
                    )}
                    {editable && (
                        <Button
                            w="100%"
                            onClick={onEdit}
                            color="teal"
                            variant="filled"
                        >
                            Edit
                        </Button>
                    )}
                </Flex>
            </Stack>
            {content.keywords.map((key, idx) => (
                <Stack key={idx + key.keyword}>
                    <Text>{key.keyword}</Text>
                    <List>
                        {key.explanation.map((exp, idx) => (
                            <List.Item key={idx + exp.text}>
                                <Text>
                                    {exp.text}
                                </Text>
                            </List.Item>
                        ))}
                    </List>
                </Stack>
            ))}
        </Stack>
    )
}


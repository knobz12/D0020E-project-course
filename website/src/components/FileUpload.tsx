import React, { useRef, useState } from "react"
import {
    Button,
    Container,
    Group,
    List,
    Stack,
    Text,
    Title,
    rem,
    useMantineTheme,
} from "@mantine/core"
import { Page } from "@/components/Page"
import { Dropzone } from "@mantine/dropzone"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"

interface FileUploadProps {
    title: string
    apiUrl: string
}

export default function FileUpload({ apiUrl, title }: FileUploadProps) {
    const ref = useRef<HTMLInputElement>(null)
    const [data, setData] = useState<string | null>(null)
    const [files, setFiles] = useState<File[]>([])
    const theme = useMantineTheme()

    async function onClick() {
        // const res = await fetch("/api/stream")
        const data = new FormData()
        const file = files.at(0)

        if (!file) {
            throw new Error("Missing file!")
        }

        data.set("file", file)
        const res = await fetch(apiUrl, {
            method: "POST",
            body: data,
        })
        console.log(res)
        const reader = res.body?.getReader()

        if (!reader) {
            throw new Error("No reader")
        }

        setData("")
        while (true) {
            const { done, value } = await reader.read()

            if (done) {
                break
            }

            if (value === undefined) {
                continue
            }

            // console.log(value)
            const str = new TextDecoder().decode(value)
            console.log(str)
            // console.log()
            setData((current) => (current += str))
        }
    }

    return (
        <Page>
            <Container size="xs" w="100%">
                <Stack>
                    <Stack>
                        <Title>{title}</Title>
                    </Stack>
                    {files.length > 0 ? (
                        <List>
                            {files.map((file, idx) => (
                                <List.Item key={idx + file.name}>
                                    {file.name}
                                </List.Item>
                            ))}
                        </List>
                    ) : null}
                    <Dropzone
                        accept={[
                            "text/html",
                            "application/pdf",
                            "text/plain",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        ]}
                        onDrop={(files) => {
                            setFiles((current) => [...current, ...files])
                        }}
                    >
                        <Group
                            position="center"
                            spacing="xl"
                            style={{
                                minHeight: rem(220),
                                pointerEvents: "none",
                            }}
                        >
                            <Dropzone.Accept>
                                <IconUpload
                                    size="3.2rem"
                                    stroke={1.5}
                                    color={
                                        theme.colors[theme.primaryColor][
                                            theme.colorScheme === "dark" ? 4 : 6
                                        ]
                                    }
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size="3.2rem"
                                    stroke={1.5}
                                    color={
                                        theme.colors.red[
                                            theme.colorScheme === "dark" ? 4 : 6
                                        ]
                                    }
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconPhoto size="3.2rem" stroke={1.5} />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag images here or click to select files
                                </Text>
                                <Text size="sm" color="dimmed" inline mt={7}>
                                    Attach as many files as you like, each file
                                    should not exceed 5mb
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                    <Stack w="100%">
                        <Button onClick={onClick}>Generate</Button>
                    </Stack>
                    {/* {data !== null && <Textarea h="96rem" value={data} />} */}
                    {data !== null && (
                        // <Text dangerouslySetInnerHTML={{ __html: data }} />
                        <Text>
                            {data.split("\n").map((val, idx) => (
                                <Text key={val + idx}>{val}</Text>
                            ))}
                        </Text>
                    )}
                </Stack>
            </Container>
        </Page>
    )
}

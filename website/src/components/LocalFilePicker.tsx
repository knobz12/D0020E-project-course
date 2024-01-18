import {
    Flex,
    AspectRatio,
    Stack,
    Badge,
    CloseButton,
    Group,
    rem,
    Text,
    useMantineTheme,
    Box,
} from "@mantine/core"
import { Dropzone } from "@mantine/dropzone"
import { showNotification } from "@mantine/notifications"
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react"
import { encode } from "jose/base64url"
import React, { useEffect, useState } from "react"

interface LocalFilePickerProps {
    isLoading: boolean
    onSelect: (file: File | null) => void
}

export function LocalFilePicker({ isLoading, onSelect }: LocalFilePickerProps) {
    const theme = useMantineTheme()
    const [inputFile, setFile] = useState<{ file: File; url?: string } | null>(
        null,
    )

    useEffect(
        function () {
            onSelect(inputFile?.file ?? null)
        },
        [onSelect, inputFile],
    )

    if (inputFile !== null) {
        // return null
        return (
            <Flex align="center" w="100%">
                <Flex gap="md" align="center" className="grow">
                    <Stack spacing="sm">
                        <Text size="xl">{inputFile.file.name}</Text>
                    </Stack>
                </Flex>
                <CloseButton
                    disabled={isLoading}
                    onClick={() => setFile(null)}
                    size="lg"
                />
            </Flex>
        )
    }

    return (
        <Dropzone
            disabled={isLoading}
            accept={[
                "text/html",
                "image/jpg",
                "image/jpeg",
                "image/png",
                "application/pdf",
                "text/plain",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ]}
            onDrop={async (files) => {
                const file = files.at(0)

                if (!file) {
                    return
                }

                if (file.size > 30_000_000) {
                    return showNotification({
                        color: "orange",
                        title: "File too large",
                        message: "Size of file cannot exceed 30MB.",
                    })
                }

                if (file.type.startsWith("image/")) {
                    const buffer = await file.arrayBuffer()
                    const bytes = new Uint8Array(buffer)
                    const url = `data:image/png;base64,` + encode(bytes)
                    setFile({ file, url: url })
                    return
                }
                setFile({ file })
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
                        Drag files here or click to select files
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                        Only attach one file, it should not exceed 30MB
                    </Text>
                </div>
            </Group>
        </Dropzone>
    )
}

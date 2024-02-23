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
    onSelect: (file: File[] | null) => void
}

export function LocalFilePicker({ isLoading, onSelect }: LocalFilePickerProps) {
    const theme = useMantineTheme()
    const [inputFiles, setFile] = useState<File[]>([])

    useEffect(
        function () {
            onSelect(inputFiles)
        },
        [onSelect, inputFiles],
    )

    if (inputFiles.length > 0) {
        return (
            <Stack>
                {inputFiles.map((file, i) => {
                    return (
                        <Flex key={i + file.name} align="center" w="100%">
                            <Flex gap="md" align="center" className="grow">
                                <Stack spacing="sm">
                                    <Text size="xl">{file.name}</Text>
                                </Stack>
                            </Flex>
                            <CloseButton
                                disabled={isLoading}
                                onClick={() =>
                                    setFile((current) =>
                                        current.filter((_, id) => id !== i),
                                    )
                                }
                                size="lg"
                            />
                        </Flex>
                    )
                })}
            </Stack>
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
                const file_size_sum = files
                    .map((file) => file.size)
                    .reduce((previous, current) => previous + current)

                if (file_size_sum > 100_000) {
                    return showNotification({
                        color: "orange",
                        title: "Files too large",
                        message: "Size of files cannot exceed 100KB.",
                    })
                }

                setFile(files)
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
                        The total file sizes should not exceed 100KB
                    </Text>
                </div>
            </Group>
        </Dropzone>
    )
}

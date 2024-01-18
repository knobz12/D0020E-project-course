import React, { useEffect, useRef, useState } from "react"
import {
    AspectRatio,
    Badge,
    Box,
    Button,
    CloseButton,
    Container,
    Flex,
    Group,
    NumberInput,
    Stack,
    Text,
    TextInput,
    Title,
    rem,
    useMantineTheme,
} from "@mantine/core"
import { showNotification } from "@mantine/notifications"
import { Page } from "@/components/Page"
import { Dropzone } from "@mantine/dropzone"
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { useRouter } from "next/router"
import type { PromptType } from "@prisma/client"
import { QuizContent } from "./QuizContent"
import dynamic from "next/dynamic"

const MultiSelect = dynamic(() => import("@mantine/core").then((el) => el.MultiSelect), {
    loading: () => <p>Loading...</p>,
    ssr: false,
  });

export function Multi() {
  const inputref = useRef<HTMLInputElement>(null)
  const [data, setData] = useState<{value:string, label:string}[]>([]);
  const [key, setkey] = useState("");
  function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    setkey(event.key)
    console.log(event.key)
    if (event.key === 'Enter') {event.preventDefault(); const inp = document.getElementById("multi") as HTMLInputElement; console.log(inp.value); 
        const item = { value: inp.value, label: inp.value, selected: true };
        setData((current) => [...current, item]);
        inp.value = "";
        console.log(inp.value);

    }
  }
  useEffect(() => console.log(data), [data]);
  return (
    typeof window !== undefined && (
    <MultiSelect
      ref={inputref}
      id="multi"
      dropdownComponent={() => null}
      maxSelectedValues={10}
      label="Creatable MultiSelect"
      data={data}
      placeholder="Select items"
      searchable
      creatable
      getCreateLabel={(query) => `+ Create ${query}`}
      onKeyDown={(keyDown)}
      value={data.map(val => val.value)}
      onCreate={(query) => {
        const item = { value: query, label: query };
        setData((current) => [...current, item]);
        return item;
      }} 
    />
    ) 
  );
}

function encode(input: Uint8Array) {
    var keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    var output = ""
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4
    var i = 0

    while (i < input.length) {
        chr1 = input[i++]
        chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
        chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

        enc1 = chr1 >> 2
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
        enc4 = chr3 & 63

        if (isNaN(chr2)) {
            enc3 = enc4 = 64
        } else if (isNaN(chr3)) {
            enc4 = 64
        }
        output +=
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4)
    }
    return output
}

interface FileUploadProps {
    title: string
    apiUrl: string
    type: PromptType
    parameters?: {
        type: "number" | "string" | "Multi"
        id: string
        name: string
        placeholder: string
    }[]
}

export default function FileUpload({
    apiUrl,
    title,
    type,
    parameters,
}: FileUploadProps) {
    const router = useRouter()
    const [data, setData] = useState<string | null>(null)
    const [params, setParams] = useState<
        Record<string, string | number | undefined>
    >({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [inputFile, setFile] = useState<{ file: File; url?: string } | null>(
        null,
    )
    const theme = useMantineTheme()

    async function onClick() {
        setIsLoading(true)
        try {
            const data = new FormData()
            const file = inputFile?.file

            if (!file) {
                return showNotification({
                    color: "blue",
                    message: "You must select a file first",
                })
            }

            data.set("file", file)
            const url = new URL(apiUrl)

            for (const [key, value] of Object.entries(params)) {
                url.searchParams.set(key, String(value))
            }

            const course = router.query.course
            if (typeof course !== "string") {
                return showNotification({
                    color: "red",
                    message: "Couldn't find course",
                })
            }

            url.searchParams.set("course", course)

            console.log("USING URL:", url.toString())
            const res = await fetch(url.toString(), {
                method: "POST",
                body: data,
                credentials: "include",
            }).catch((e) => null)

            if (res === null) {
                console.error(res)
                return showNotification({
                    color: "red",
                    message: "Failed to make request",
                })
            }

            if (res.status !== 200) {
                console.error(res)
                return showNotification({
                    color: "red",
                    message: await res.text(),
                })
            }

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
        } catch (e) {
            if (e instanceof Error) {
                console.error(e)
                showNotification({
                    color: "red",
                    title: "Something went wrong",
                    message: e.message,
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Page center>
            <Container size="xs" w="100%">
                <Stack>
                    <Stack>
                        <Title>{title}</Title>
                    </Stack>
                    {parameters && (
                        <Stack>
                            {parameters.map((parameter) => {
                                switch (parameter.type) {
                                    case "number":
                                        return (
                                            <NumberInput
                                                key={parameter.id}
                                                label={parameter.name}
                                                id={parameter.id}
                                                name={parameter.id}
                                                onChange={(e) => {
                                                    if (e === "") {
                                                        return setParams(
                                                            (curr) => {
                                                                const newParams =
                                                                    {
                                                                        ...curr,
                                                                        [parameter.id]:
                                                                            undefined,
                                                                    }
                                                                console.log(
                                                                    newParams,
                                                                )
                                                                return newParams
                                                            },
                                                        )
                                                    }

                                                    setParams((curr) => {
                                                        const newParams = {
                                                            ...curr,
                                                            [parameter.id]: e,
                                                        }
                                                        console.log(newParams)
                                                        return newParams
                                                    })
                                                }}
                                                placeholder={
                                                    parameter.placeholder
                                                }
                                            />
                                        )
                                    case "string":
                                        return (
                                            <TextInput
                                                key={parameter.id}
                                                label={parameter.name}
                                                id={parameter.id}
                                                name={parameter.id}
                                                onChange={(e) => {
                                                    var myString = e.target.value
                                                    if (myString === "") {
                                                        return setParams(
                                                            (curr) => {
                                                                const newParams =
                                                                    {
                                                                        ...curr,
                                                                        [parameter.id]:
                                                                            undefined,
                                                                    }
                                                                console.log(
                                                                    newParams,
                                                                )
                                                                return newParams
                                                            },
                                                        )
                                                    }

                                                    setParams((curr) => {
                                                        const newParams = {
                                                            ...curr,
                                                            [parameter.id]: myString,
                                                        }
                                                        console.log(newParams)
                                                        return newParams
                                                    })
                                                }}
                                                placeholder={
                                                    parameter.placeholder
                                                }
                                            />
                                        )
                                        case "Multi":
                                        return (
                                            <Multi/>
                                        )
                                }
                            })}
                        </Stack>
                    )}
                    {inputFile !== null ? (
                        <Flex align="center" w="100%">
                            <Flex gap="md" align="center" className="grow">
                                {inputFile.url && (
                                    <AspectRatio
                                        ratio={16 / 9}
                                        className="w-full h-full"
                                        maw="128px"
                                        mah="128px"
                                    >
                                        <img
                                            className="w-full h-full"
                                            src={inputFile.url}
                                        />
                                    </AspectRatio>
                                )}
                                <Stack spacing="sm">
                                    <Text size="xl">{inputFile.file.name}</Text>
                                    <Box>
                                        <Badge>{inputFile.file.type}</Badge>
                                    </Box>
                                </Stack>
                            </Flex>
                            <CloseButton
                                disabled={isLoading}
                                onClick={() => setFile(null)}
                                size="lg"
                            />
                        </Flex>
                    ) : (
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
                                        message:
                                            "Size of file cannot exceed 30MB.",
                                    })
                                }

                                if (file.type.startsWith("image/")) {
                                    const buffer = await file.arrayBuffer()
                                    const bytes = new Uint8Array(buffer)
                                    const url =
                                        `data:image/png;base64,` + encode(bytes)
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
                                                theme.colorScheme === "dark"
                                                    ? 4
                                                    : 6
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
                                                theme.colorScheme === "dark"
                                                    ? 4
                                                    : 6
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
                                    <Text
                                        size="sm"
                                        color="dimmed"
                                        inline
                                        mt={7}
                                    >
                                        Only attach one file, it should not
                                        exceed 30MB
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                    )}
                    <Stack w="100%">
                        <Button loading={isLoading} onClick={onClick}>
                            Generate
                        </Button>
                    </Stack>
                    {/* {data !== null && <Textarea h="96rem" value={data} />} */}
                    {data !== null &&
                        (type === "QUIZ" ? (
                            typeof data === "string" &&
                            data !== "" && (
                                <QuizContent content={JSON.parse(data)} />
                            )
                        ) : (
                            <Text>
                                {data.split("\n").map((val, idx) => (
                                    <Text key={val + idx}>{val}</Text>
                                ))}
                            </Text>
                        ))}
                </Stack>
            </Container>
        </Page>
    )
}

import { Page } from "@/components/Page"
import { Box, Button, Center, Image, Stack, Title } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import React, { useEffect, useRef, useState } from "react"
import { authOptions } from "../api/auth/[...nextauth]"
import { useSession } from "next-auth/react"

interface ProfilePageProps {}

export default function ProfilePage({}: ProfilePageProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const auth = useSession()
    const [count, setCount] = useState<number>(0)

    useEffect(() => {
        // audioRef.current?.volume = 1
        if (count >= 10) {
            audioRef.current!.volume = 0
            return
        }
        const cl = document.documentElement.classList

        if (cl.contains("stop")) {
            cl.remove("stop")
        }

        const interval = setInterval(function () {
            audioRef.current?.play()
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    function randomlyMoveButton() {
        const parent = buttonRef.current?.parentElement
        const [left, top] = [parent?.clientLeft, parent?.clientTop] as [
            number,
            number,
        ]
        const [width, height] = [parent?.clientWidth, parent?.clientHeight] as [
            number,
            number,
        ]
        const minY = top
        const maxY = top + height
        const minX = left
        const maxX = left + width
        // buttonRef.current!.clientLeft = Math.random() * (maxX - minX)
        buttonRef.current!.setAttribute(
            "style",
            `top:${Math.random() * (maxY - minY)}px;left:${
                Math.random() * (maxX - minX)
            }px`,
        )
    }

    function buttonClick() {
        if (count >= 10) {
            if (audioRef.current) {
                audioRef.current.volume = 0
                audioRef.current.pause()
            }
            document.getElementById("music")?.remove()
            const cl = document.documentElement.classList
            if (!cl.contains("stop")) {
                document.documentElement.classList.add("stop")
            }
        }
    }

    return (
        <Page>
            <Center h="100%">
                <Stack>
                    <Stack
                        align="center"
                        pt={128}
                        style={
                            count <= 10
                                ? {
                                      animationName: "rotat",
                                      animationDuration: "20s",
                                      animationIterationCount: "infinite",
                                      animationTimingFunction: "linear",
                                      transformOrigin: "bottom",
                                      // animationDirection: "normal"
                                  }
                                : undefined
                        }
                    >
                        <Title>{auth.data?.user.name}</Title>
                        <Image
                            radius="xl"
                            alt={`${auth.data?.user.name} avatar`}
                            src="https://cdn.aistudybuddy.se/avatar.jpg"
                            width={512}
                        />
                        <audio
                            id="music"
                            autoPlay={true}
                            ref={audioRef}
                            loop={true}
                        >
                            <source
                                src="https://cdn.aistudybuddy.se/profile.mp3"
                                type="audio/mp3"
                            />
                        </audio>
                    </Stack>
                    {count <= 10 && (
                        <Box w="100%" h="16rem" pos="relative">
                            <Button
                                ref={buttonRef}
                                onMouseOver={() => {
                                    if (count < 5) {
                                        setCount((current) => current + 1)
                                        randomlyMoveButton()
                                    }
                                }}
                                onClick={() => {
                                    if (count >= 5 && count < 11) {
                                        setCount((current) => current + 1)
                                        randomlyMoveButton()
                                        buttonClick()
                                    }
                                }}
                                pos="absolute"
                                style={{ top: 0, left: 0 }}
                            >
                                Stop music
                            </Button>
                        </Box>
                    )}
                </Stack>
            </Center>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes rotat {
                    0% {
                        transform: rotate(0deg);
                    }
                    50% {
                        transform: rotate(180deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                @keyframes anim {
                    0% {
                        filter:hue-rotate(90deg) saturate(4);
                    }
                    50% {
                        filter:hue-rotate(270deg) saturate(0.7);
                    }
                    100% {
                        filter:hue-rotate(90deg) saturate(4);
                    }
                }
                html {
                    animation-name: anim;
                    animation-duration: 8s;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                    animation-direction: normal;
                }
                html.stop {
                    animation-name: none;
                    animation-duration: 8s;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                    animation-direction: normal;
                }
            `,
                }}
            ></style>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
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
}) satisfies GetServerSideProps

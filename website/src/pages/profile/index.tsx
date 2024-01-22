import { Page } from "@/components/Page"
import { Center } from "@mantine/core"
import React from "react"

interface ProfilePageProps {}

export default function ProfilePage({}: ProfilePageProps) {
    return (
        <Page>
            <Center h="100%">
                <img src="https://i.imgur.com/4W68gCL.jpg" width={512} />
            </Center>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @keyframes anim {
                    0% {
                        filter:hue-rotate(0deg)
                    }
                    50% {
                        filter:hue-rotate(90deg)
                    }
                    100% {
                        filter:hue-rotate(0deg)
                    }
                }
                html {
                    animation-name: anim;
                    animation-duration: 2s;
                    animation-iteration-count: infinite;
                }
            `,
                }}
            ></style>
        </Page>
    )
}

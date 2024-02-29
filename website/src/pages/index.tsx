import { Page } from "@/components/Page"
import { Group, Button } from "@mantine/core"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import Link from "next/link"
import React from "react"
import { authOptions } from "./api/auth/[...nextauth]"
import { useSession } from "next-auth/react"
import { BackgroundBeams } from "@/components/Beams"

interface LandingPageProps {}

export default function LandingPage({}: LandingPageProps) {
    const auth = useSession()
    return (
        <Page center>
            {/* <Box> */}
            <div className="flex h-full flex-col justify-center">
                {/* <div className="absolute top-0 left-0 w-full h-full -z-10"> */}
                {/* <BackgroundBeams /> */}
                {/* </div> */}
                <div className="relative px-6 pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <div className="space-y-8 text-center">
                            <div className="space-y-6">
                                <h1 className="m-0 text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
                                    The worlds best AI studying assistant
                                </h1>
                                <p className="m-0 mt-6 text-lg leading-6 text-gray-400 sm:leading-7">
                                    Unlock your full learning potential with the
                                    world&apos;s best AI studying assistant,
                                    elevating your academic experience through
                                    intelligent guidance and support.
                                </p>
                            </div>
                            <Group position="center">
                                <Link href={"/courses"} passHref legacyBehavior>
                                    <Button
                                        component="a"
                                        size="lg"
                                        variant="white"
                                    >
                                        View app
                                    </Button>
                                </Link>
                                {auth.status !== "authenticated" && (
                                    <Link
                                        href="/api/auth/signin"
                                        passHref
                                        legacyBehavior
                                    >
                                        <Button component="a" size="lg">
                                            Log in
                                        </Button>
                                    </Link>
                                )}
                            </Group>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

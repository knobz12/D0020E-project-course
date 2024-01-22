import { Page } from "@/components/Page"
import {
    Container,
    Title,
    List,
    ThemeIcon,
    rem,
    Group,
    Button,
    Text,
    Box,
} from "@mantine/core"
import { IconCheck } from "@tabler/icons-react"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { authOptions } from "./api/auth/[...nextauth]"
import { useSession } from "next-auth/react"

interface LandingPageProps {}

export default function LandingPage({}: LandingPageProps) {
    const auth = useSession()
    return (
        <Page>
            {/* <Box> */}
            <div className="relative px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
                            The worlds best AI studying assistant
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-400">
                            Anim aute id magna aliqua ad ad non deserunt sunt.
                            Qui irure qui lorem cupidatat commodo. Elit sunt
                            amet fugiat veniam occaecat fugiat aliqua.
                        </p>
                        <Group position="center">
                            <Link href={"/courses"} passHref legacyBehavior>
                                <Button component="a" size="lg" variant="white">
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

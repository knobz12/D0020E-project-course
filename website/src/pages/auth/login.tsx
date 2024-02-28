import { Page } from "@/components/Page"
import {
    Button,
    Center,
    Container,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import { IconBrandDiscord, IconBrandGithub } from "@tabler/icons-react"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Image from "next/image"
import React, { useEffect } from "react"
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth"
import { getProviders, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { showNotification } from "@mantine/notifications"

interface ProviderButtonProps {
    providerId: string
    name: string
    href: string
}

function ProviderButton({
    providerId,
    name,
}: ProviderButtonProps): React.ReactNode {
    switch (providerId) {
        case "github":
            return (
                <Button
                    size="lg"
                    onClick={() =>
                        signIn(providerId, { callbackUrl: "/courses" })
                    }
                    bg="gray.9"
                    sx={(theme) => ({
                        ":hover": {
                            backgroundColor: theme.colors.gray[8],
                        },
                        ":active": {
                            backgroundColor: theme.colors.gray[8],
                        },
                    })}
                >
                    <Group spacing="xs">
                        <IconBrandGithub />
                        Sign in with {name}
                    </Group>
                </Button>
            )
        case "google":
            return (
                <Button
                    onClick={() => signIn(providerId)}
                    size="lg"
                    variant="white"
                    color="gray.7"
                >
                    <Group spacing="xs">
                        <img
                            alt="Google logo"
                            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                            width={20}
                            height={20}
                        />
                        Sign in with {name}
                    </Group>
                </Button>
            )
        default:
            return <></>
    }
}

interface SignInPageProps
    extends InferGetServerSidePropsType<typeof getServerSideProps> {}

export default function SignInPage({ providers }: SignInPageProps) {
    const router = useRouter()
    useEffect(
        function () {
            const error = router.query.error
            if (typeof error !== "string") {
                return
            }
            showNotification({
                color: "info",
                title: "Error during sign in",
                message: error,
            })
            const url = new URL(router.asPath, "http://example.com")
            url.searchParams.delete("error")
            router.replace(url.pathname, undefined, { shallow: true })
        },
        [router],
    )
    return (
        <Page navbar={false} center>
            <Container size="xs">
                <Stack align="center" spacing={48} w="100%">
                    <Stack align="center">
                        <Image
                            src="https://cdn.aistudybuddy.se/logo.png"
                            width={128}
                            height={128}
                            loading="eager"
                            alt="AI Studybuddy logo"
                        />
                        <Title order={1} size={48}>
                            AI Studybuddy
                        </Title>
                    </Stack>
                    <Paper p="xl" radius="lg" w="100%">
                        <Stack>
                            <Stack>
                                {providers &&
                                    Object.values(providers).map(
                                        (provider, idx) => (
                                            <ProviderButton
                                                key={provider.id}
                                                providerId={provider.id}
                                                name={provider.name}
                                                href={provider.signinUrl}
                                            />
                                        ),
                                    )}
                            </Stack>

                            <Divider color="bluegray.6" />

                            <Text ta="center">Available soon</Text>
                            <Stack>
                                {!providers?.google && (
                                    <Button
                                        component="a"
                                        variant="white"
                                        color="gray.7"
                                        size="lg"
                                    >
                                        <Group spacing="xs">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                                                width={20}
                                                height={20}
                                            />
                                            Sign in with Google
                                        </Group>
                                    </Button>
                                )}
                                <Button
                                    bg="#7289da"
                                    size="lg"
                                    sx={{
                                        ":hover": {
                                            backgroundColor: "#7289da",
                                        },
                                        ":active": {
                                            backgroundColor: "#7289da",
                                        },
                                    }}
                                >
                                    <Group spacing="xs">
                                        <IconBrandDiscord /> Sign in with
                                        Discord
                                    </Group>
                                </Button>
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    if (session !== null) {
        return { redirect: { destination: "/courses", permanent: false } }
    }

    const providers = await getProviders()
    console.log("Providers:", providers)

    return {
        props: {
            providers,
        },
    }
}) satisfies GetServerSideProps

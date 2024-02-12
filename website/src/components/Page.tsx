import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Menu,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import clsx from "clsx"
import { Inter } from "next/font/google"
import React from "react"
import { useSession, signOut } from "next-auth/react"
import {
    IconList,
    IconLogout,
    IconSettings,
    IconUser,
} from "@tabler/icons-react"
import Link from "next/link"
import Image from "next/image"
import { BreadcrumbsRouter } from "./BreadcrumbsRouter"
import { GradientBackground } from "./GradientBackground"
import { useRouter } from "next/router"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

interface PageProps {
    children: React.ReactNode
    center?: boolean
    navbar?: boolean
}

export function Page({ children, navbar = true }: PageProps) {
    const { data, status } = useSession()

    return (
        <div
            className={clsx(
                inter.className,
                "min-h-screen flex flex-col items-start",
            )}
        >
            {navbar && (
                <header className="flex justify-between py-4 w-full mx-auto max-w-4xl">
                    <Stack w="100%">
                        <Flex justify="space-between" w="100%" align="center">
                            <Link
                                href={
                                    status === "authenticated"
                                        ? "/courses"
                                        : "/"
                                }
                                className="no-underline flex items-center space-x-4"
                            >
                                <Image
                                    loading="eager"
                                    width={64}
                                    height={64}
                                    src="https://cdn.aistudybuddy.se/logo.png"
                                    alt="AI Studybuddy logo"
                                />
                                <Title>AI Studybuddy</Title>
                            </Link>
                            {status === "authenticated" ? (
                                <div>
                                    <Menu>
                                        <Menu.Target>
                                            <Button
                                                variant="subtle"
                                                color="blue"
                                                p={4}
                                                h={54}
                                                className="flex justify-end"
                                            >
                                                <Flex align="center" gap="sm">
                                                    {data.user?.image && (
                                                        <Avatar
                                                            src={
                                                                data.user.image
                                                            }
                                                        />
                                                    )}
                                                    {data.user?.name && (
                                                        <Stack spacing={0}>
                                                            <Text
                                                                size="xl"
                                                                color="white"
                                                                fw={600}
                                                            >
                                                                {data.user.name}
                                                            </Text>
                                                            <Box>
                                                                <Badge
                                                                    color={
                                                                        data
                                                                            .user
                                                                            .type ===
                                                                        "STUDENT"
                                                                            ? "blue"
                                                                            : "green"
                                                                    }
                                                                    size="sm"
                                                                >
                                                                    {
                                                                        data
                                                                            .user
                                                                            .type
                                                                    }
                                                                </Badge>
                                                            </Box>
                                                        </Stack>
                                                    )}
                                                </Flex>
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Link
                                                href="/profile"
                                                passHref
                                                legacyBehavior
                                            >
                                                <Menu.Item
                                                    component="a"
                                                    icon={<IconUser />}
                                                >
                                                    Profile
                                                </Menu.Item>
                                            </Link>
                                            <Link
                                                href="/profile/prompts"
                                                passHref
                                                legacyBehavior
                                            >
                                                <Menu.Item
                                                    component="a"
                                                    icon={<IconList />}
                                                >
                                                    Your prompts
                                                </Menu.Item>
                                            </Link>
                                            <Link
                                                href="/profile/settings"
                                                passHref
                                                legacyBehavior
                                            >
                                                <Menu.Item
                                                    component="a"
                                                    icon={<IconSettings />}
                                                >
                                                    Settings
                                                </Menu.Item>
                                            </Link>
                                            <Menu.Divider />
                                            <Menu.Item
                                                icon={<IconLogout />}
                                                onClick={() => signOut()}
                                            >
                                                Logout
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </div>
                            ) : (
                                <Flex gap="sm">
                                    <Link
                                        href={`/api/auth/signin`}
                                        passHref
                                        legacyBehavior
                                        className="no-underline"
                                    >
                                        <Button component="a">Log in</Button>
                                    </Link>
                                    <Link
                                        href="/api/auth/signin"
                                        passHref
                                        legacyBehavior
                                        className="no-underline"
                                    >
                                        <Button component="a" variant="white">
                                            Sign up
                                        </Button>
                                    </Link>
                                </Flex>
                            )}
                        </Flex>
                        <BreadcrumbsRouter />
                    </Stack>
                </header>
            )}

            <GradientBackground center>{children}</GradientBackground>
        </div>
    )
}

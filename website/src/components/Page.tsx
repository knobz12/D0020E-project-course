import {
    Avatar,
    Badge,
    Box,
    Button,
    Flex,
    Menu,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import clsx from "clsx"
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
import { BackgroundBeams } from "./Beams"

interface PageProps {
    children: React.ReactNode
    center?: boolean
    navbar?: boolean
}

export function Page({ children, center = false, navbar = true }: PageProps) {
    const { data, status } = useSession()

    return (
        <>
            <div
                className={clsx(
                    center && "justify-star flex min-h-screen flex-col",
                )}
            >
                {navbar && (
                    <header className="z-20 mx-auto flex w-full max-w-4xl justify-between py-4">
                        <Stack w="100%" className="px-4 lg:px-0">
                            <Flex
                                justify="space-between"
                                w="100%"
                                align="center"
                            >
                                <Link
                                    href={
                                        status === "authenticated"
                                            ? "/courses"
                                            : "/"
                                    }
                                    className="flex items-center space-x-4 no-underline"
                                >
                                    <Image
                                        loading="eager"
                                        width={64}
                                        height={64}
                                        src="https://cdn.aistudybuddy.se/logo.png"
                                        alt="AI Studybuddy logo"
                                    />
                                    <Title className="hidden sm:block">
                                        AI Studybuddy
                                    </Title>
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
                                                    <Flex
                                                        align="center"
                                                        gap="sm"
                                                    >
                                                        {data.user?.image && (
                                                            <Avatar
                                                                src={
                                                                    data.user
                                                                        .image
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
                                                                    {
                                                                        data
                                                                            .user
                                                                            .name
                                                                    }
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
                                            <Button component="a">
                                                Log in
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/api/auth/signin"
                                            passHref
                                            legacyBehavior
                                            className="no-underline"
                                        >
                                            <Button
                                                component="a"
                                                variant="white"
                                            >
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

                <GradientBackground center={center}>
                    {children}
                </GradientBackground>
            </div>
            <BackgroundBeams />
        </>
    )
}

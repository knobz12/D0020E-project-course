import { Avatar, Box, Container, Flex, Menu, Text, Title } from "@mantine/core"
import clsx from "clsx"
import { Inter } from "next/font/google"
import React from "react"
import { useSession, signOut } from "next-auth/react"
import { IconLogout } from "@tabler/icons-react"

const inter = Inter({ subsets: ["latin"] })

interface PageProps {
    children: React.ReactNode
    center?: boolean
}

export function Page({ children, center = false }: PageProps) {
    const { data, status } = useSession()

    return (
        <div className={clsx(inter.className, "min-h-screen")}>
            <Container className="flex justify-between py-4">
                <Title>AI Studybuddy</Title>
                {status === "authenticated" && (
                    <div>
                        <Menu>
                            <Menu.Target>
                                <header className="flex justify-end">
                                    <Flex align="center" gap="sm">
                                        {data.user?.image && (
                                            <Avatar src={data.user.image} />
                                        )}
                                        {data.user?.name && (
                                            <Text
                                                size="xl"
                                                color="white"
                                                fw={600}
                                            >
                                                {data.user.name}
                                            </Text>
                                        )}
                                    </Flex>
                                </header>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    icon={<IconLogout />}
                                    onClick={() => signOut()}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                )}
            </Container>
            <Box
                component="main"
                className={clsx(
                    center &&
                        "flex flex-grow justify-center items-center h-full",
                )}
            >
                <Box
                    sx={(theme) => ({
                        backgroundImage: theme.fn.radialGradient(
                            theme.colors.bluegray[8],
                            theme.colors.bluegray[9],
                        ),
                    })}
                    className="top-0 fixed w-screen min-h-screen -z-50"
                ></Box>
                {children}
            </Box>
        </div>
    )
}

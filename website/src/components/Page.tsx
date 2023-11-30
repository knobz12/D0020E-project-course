import { Box } from "@mantine/core"
import clsx from "clsx"
import { Inter } from "next/font/google"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

interface PageProps {
    children: React.ReactNode
    center?: boolean
}

export function Page({ children, center = false }: PageProps) {
    return (
        <Box
            component="main"
            // sx={(theme) => ({
            //     backgroundImage: theme.fn.radialGradient(
            //         theme.colors.bluegray[8],
            //         theme.colors.bluegray[9],
            //     ),
            // })}
            className={clsx(
                inter.className,
                "min-h-screen",
                center && "flex justify-center items-center",
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
    )
}

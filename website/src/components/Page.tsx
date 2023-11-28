import { Box } from "@mantine/core"
import clsx from "clsx"
import { Inter } from "next/font/google"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

interface PageProps {
    children: React.ReactNode
}

export function Page({ children }: PageProps) {
    return (
        <Box
            component="main"
            sx={(theme) => ({
                backgroundImage: theme.fn.radialGradient(
                    theme.colors.bluegray[8],
                    theme.colors.bluegray[9],
                ),
            })}
            className={clsx(
                inter.className,
                "w-screen h-screen grid place-items-center",
            )}
        >
            {children}
        </Box>
    )
}

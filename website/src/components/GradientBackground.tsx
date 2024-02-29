import { Box, clsx } from "@mantine/core"
import { Inter } from "next/font/google"
import React from "react"

interface GradientBackgroundProps {
    children: React.ReactNode
    center: boolean
}

export function GradientBackground({
    children,
    center,
}: GradientBackgroundProps) {
    return (
        <Box
            component="main"
            className={clsx(
                "flex h-full w-full flex-grow flex-col items-center justify-center",
                center && "-mt-24",
            )}
        >
            <Box
                sx={(theme) => ({
                    backgroundImage: theme.fn.radialGradient(
                        theme.colors.bluegray[8],
                        theme.colors.bluegray[9],
                    ),
                })}
                className="fixed top-0 -z-50 min-h-screen w-screen"
            />
            <Box className={"w-full"}>{children}</Box>
        </Box>
    )
}

import { Box, clsx } from "@mantine/core"
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
                center && "flex flex-grow justify-center items-center h-full",
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
            />
            {children}
        </Box>
    )
}

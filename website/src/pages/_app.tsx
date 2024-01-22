import "../../public/globals.css"
import React from "react"
import Head from "next/head"
import { MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import { Notifications } from "@mantine/notifications"
import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import type { Session } from "next-auth"
import { trpc } from "@/lib/trpc"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

function LlamaApp({
    Component,
    pageProps,
}: AppProps & { pageProps: AppProps["pageProps"] & { session: Session } }) {
    return (
        <>
            <Head>
                <title>Llama-GPT</title>
                <link rel="icon" href="/lama.png" />
            </Head>
            <SessionProvider session={pageProps.session}>
                {process.env.NODE_ENV === "development" && (
                    <ReactQueryDevtools />
                )}
                <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={{
                        colorScheme: "dark",
                        fontFamily: "var(--font-inter)",
                        colors: {
                            bluegray: [
                                "#f9fafb",
                                "#f3f4f6",
                                "#e5e7eb",
                                "#d1d5db",
                                "#9ca3af",
                                "#6b7280",
                                "#4b5563",
                                "#374151",
                                "#1f2937",
                                "#111827",
                            ],
                            emerald: [
                                "#ecfdf5",
                                "#d1fae5",
                                "#a7f3d0",
                                "#6ee7b7",
                                "#34d399",
                                "#10b981",
                                "#059669",
                                "#047857",
                                "#065f46",
                                "#064e3b",
                            ],
                        },
                        primaryColor: "blue",
                        primaryShade: { dark: 6, light: 6 },
                        components: {
                            Paper: {
                                styles(theme, params, context) {
                                    return {
                                        root: {
                                            backgroundColor: `${theme.colors.blue[8]}33`,
                                        },
                                    }
                                },
                            },
                            Card: {
                                styles(theme, params, context) {
                                    return {
                                        root: {
                                            background: `${theme.colors.blue[8]}66`,
                                        },
                                    }
                                },
                            },
                            Title: {
                                defaultProps(theme) {
                                    return { color: "gray.1" }
                                },
                                styles: {
                                    root: { letterSpacing: "-0.025em" },
                                },
                            },
                            Input: {
                                styles(theme, params, context) {
                                    return {
                                        input: {
                                            background:
                                                theme.colors.bluegray[8],
                                            borderColor:
                                                theme.colors.bluegray[7],
                                            "::placeholder": {
                                                color: theme.colors.bluegray[5],
                                            },
                                        },
                                    }
                                },
                            },
                        },
                    }}
                >
                    <ModalsProvider>
                        <Notifications />
                        <Component {...pageProps} />
                    </ModalsProvider>
                </MantineProvider>
            </SessionProvider>
        </>
    )
}

export default trpc.withTRPC(LlamaApp)

import React from "react"
import {
    Card,
    Center,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core"
import { Page } from "@/components/Page"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { authOptions } from "../api/auth/[...nextauth]"
import { trpc } from "@/lib/trpc"
import dynamic from "next/dynamic"
import * as Tabler from "@tabler/icons-react"

// function IconFromName(name: string) {
//     const Component = dynamic(() =>
//         import("@tabler/icons-react").then((e) => {
//             if (name in e) {
//                 return e[name]
//             }
//             return null
//         }),
//     )
// }

export default function Home({} // courses,
: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const courses = trpc.courses.getCourses.useQuery()

    return (
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%">
                        <Title>Courses</Title>
                        <Paper px="xl" py="lg">
                            <Stack spacing="xl">
                                <Stack>
                                    <SimpleGrid cols={2}>
                                        {courses.data?.map(
                                            ({
                                                id,
                                                name,
                                                coursePage,
                                                description,
                                                prompts,
                                                tablerIcon,
                                                title,
                                            }) => {
                                                let Icon: Tabler.Icon | null =
                                                    null
                                                if (
                                                    tablerIcon &&
                                                    tablerIcon in Tabler
                                                ) {
                                                    // @ts-ignore
                                                    Icon = Tabler[tablerIcon]
                                                }
                                                return (
                                                    <Link
                                                        key={id}
                                                        href={`/courses/${name.toUpperCase()}`}
                                                        className="no-underline"
                                                    >
                                                        <Card>
                                                            <Group spacing="sm">
                                                                {Icon && (
                                                                    <Icon color="white" />
                                                                )}
                                                                <Text
                                                                    size={28}
                                                                    color="white"
                                                                    fw={700}
                                                                    underline={
                                                                        false
                                                                    }
                                                                >
                                                                    {name}
                                                                </Text>
                                                            </Group>
                                                            <Text
                                                                size="md"
                                                                fw={500}
                                                            >
                                                                {title}
                                                            </Text>
                                                        </Card>
                                                    </Link>
                                                )
                                            },
                                        )}
                                    </SimpleGrid>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Center>
            </Container>
        </Page>
    )
}

export const getServerSideProps = (async ({ req, res }) => {
    const [session] = await Promise.all([
        getServerSession(req, res, authOptions),
    ])

    return {
        props: {
            session,
        },
    }
}) satisfies GetServerSideProps

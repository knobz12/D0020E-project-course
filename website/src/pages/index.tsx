import React from "react"
import {
    Card,
    Center,
    Container,
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
import { authOptions } from "./api/auth/[...nextauth]"
import { db } from "@/lib/database"

// const courses: string[] = ["D7032E"]

export default function Home({
    courses,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Page center>
            <Container w="100%" size="sm">
                <Center w="100%" h="100%">
                    <Stack w="100%">
                        <Title>Courses</Title>
                        <Paper px="xl" py="lg">
                            <Stack spacing="xl">
                                <Stack>
                                    <SimpleGrid cols={3}>
                                        {courses.map(({ id, name }) => {
                                            // const Icon = prompt.icon
                                            return (
                                                <Link
                                                    key={id}
                                                    href={`/course/${name.toUpperCase()}`}
                                                >
                                                    <Card>
                                                        <Text
                                                            size="lg"
                                                            fw={600}
                                                        >
                                                            {name}
                                                        </Text>
                                                    </Card>
                                                </Link>
                                            )
                                        })}
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
    const [session, courses] = await Promise.all([
        getServerSession(req, res, authOptions),
        db.course.findMany({ select: { id: true, name: true } }),
    ])

    return {
        props: {
            session,
            courses,
        },
    }
}) satisfies GetServerSideProps

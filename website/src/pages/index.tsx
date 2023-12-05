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
import { GetServerSideProps } from "next"
import { authOptions } from "./api/auth/[...nextauth]"

const courses: string[] = ["D7032E"]

export default function Home() {
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
                                        {courses.map((course) => {
                                            // const Icon = prompt.icon
                                            return (
                                                <Link
                                                    key={course}
                                                    href={`/course/${course.toUpperCase()}`}
                                                >
                                                    <Card>
                                                        <Text
                                                            size="lg"
                                                            fw={600}
                                                        >
                                                            {course}
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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getServerSession(req, res, authOptions)

    return {
        props: {
            session,
        },
    }
}

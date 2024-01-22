import { Breadcrumbs, Anchor, Box } from "@mantine/core"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"

interface GoodBreadcrumbsProps {
    links: { href: string; name: string }[]
}

function GoodBreadcrumbs({ links }: GoodBreadcrumbsProps) {
    if (links.length === 0) {
        return null
    }

    return (
        <nav>
            <Breadcrumbs>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        legacyBehavior
                        passHref
                    >
                        <Anchor size="lg">{link.name}</Anchor>
                    </Link>
                ))}
            </Breadcrumbs>
        </nav>
    )
}

export function BreadcrumbsRouter() {
    const router = useRouter()
    const { data } = useSession()

    const links: GoodBreadcrumbsProps["links"] | null = useMemo(
        function () {
            console.log(router.route)
            switch (router.route) {
                // case "/":
                //     return [{ href: "/", name: "Courses" }]
                // case "/profile":
                //     return [
                //         { href: "/profile", name: data?.user.name as string },
                //     ]
                case "/profile/prompts":
                    return [
                        { href: "/profile", name: data?.user.name as string },
                        { href: "/profile/prompts", name: "prompts" },
                    ]
                case "/course/[course]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                    ]
                case "/course/[course]/quiz":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/quiz`,
                            name: "Quiz",
                        },
                    ]
                case "/course/[course]/quiz/[quizId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/quiz`,
                            name: "Quiz",
                        },
                        {
                            href: `/course/${router.query.course}/quiz/${router.query.quizId}`,
                            name: router.query.quizId as string,
                        },
                    ]
                case "/course/[course]/assignment":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/quiz`,
                            name: "Assignment",
                        },
                    ]
                case "/course/[course]/assignment/[assignmentId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/assignment`,
                            name: "Assignment",
                        },
                        {
                            href: `/course/${router.query.course}/assignment/${router.query.assignmentId}`,
                            name: router.query.assignmentId as string,
                        },
                    ]
                case "/course/[course]/flashcards":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/flashcards`,
                            name: "Flashcards",
                        },
                    ]
                case "/course/[course]/flashcards/[flashcardsId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/flashcards`,
                            name: "Flashcards",
                        },
                        {
                            href: `/course/${router.query.course}/flashcards/${router.query.flashcardsId}`,
                            name: router.query.flashcardsId as string,
                        },
                    ]
                case "/course/[course]/summary":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/summary`,
                            name: "Summary",
                        },
                    ]
                case "/course/[course]/summary/[summaryId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/summary`,
                            name: "Summary",
                        },
                        {
                            href: `/course/${router.query.course}/summary/${router.query.summaryId}`,
                            name: router.query.summaryId as string,
                        },
                    ]
                case "/course/[course]/explainer":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/explainer`,
                            name: "Explainer",
                        },
                    ]
                case "/course/[course]/explainer/[explainerId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/course/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/course/${router.query.course}/explainer`,
                            name: "Explainer",
                        },
                        {
                            href: `/course/${router.query.course}/explainer/${router.query.explainerId}`,
                            name: router.query.explainerId as string,
                        },
                    ]
                default:
                    return null
            }
        },
        [router.route, router.query],
    )

    if (links === null) {
        return null
    }

    return (
        <Box pb="lg">
            <GoodBreadcrumbs links={links} />
        </Box>
    )
}

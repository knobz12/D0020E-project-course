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
            switch (router.route) {
                // case "/"
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
                case "/courses/[course]":
                    return [
                        { href: "/courses", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                    ]
                case "/courses/[course]/question":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/question`,
                            name: "Question",
                        },
                    ]
                case "/courses/[course]/quiz":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/quiz`,
                            name: "Quiz",
                        },
                    ]
                case "/courses/[course]/quiz/[quizId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/quiz`,
                            name: "Quiz",
                        },
                        {
                            href: `/courses/${router.query.course}/quiz/${router.query.quizId}`,
                            name: router.query.quizId as string,
                        },
                    ]
                case "/courses/[course]/assignment":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/quiz`,
                            name: "Assignment",
                        },
                    ]
                case "/courses/[course]/assignment/[assignmentId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/assignment`,
                            name: "Assignment",
                        },
                        {
                            href: `/courses/${router.query.course}/assignment/${router.query.assignmentId}`,
                            name: router.query.assignmentId as string,
                        },
                    ]
                case "/courses/[course]/flashcards":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/flashcards`,
                            name: "Flashcards",
                        },
                    ]
                case "/courses/[course]/flashcards/[flashcardsId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/flashcards`,
                            name: "Flashcards",
                        },
                        {
                            href: `/courses/${router.query.course}/flashcards/${router.query.flashcardsId}`,
                            name: router.query.flashcardsId as string,
                        },
                    ]
                case "/courses/[course]/summary":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/summary`,
                            name: "Summary",
                        },
                    ]
                case "/courses/[course]/summary/[summaryId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/summary`,
                            name: "Summary",
                        },
                        {
                            href: `/courses/${router.query.course}/summary/${router.query.summaryId}`,
                            name: router.query.summaryId as string,
                        },
                    ]
                case "/courses/[course]/explainer":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/explainer`,
                            name: "Explainer",
                        },
                    ]
                case "/courses/[course]/explainer/[explainerId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/explainer`,
                            name: "Explainer",
                        },
                        {
                            href: `/courses/${router.query.course}/explainer/${router.query.explainerId}`,
                            name: router.query.explainerId as string,
                        },
                    ]
                case "/courses/[course]/divideAssignment":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/divideAssignment`,
                            name: "DivideAssignment",
                        },
                    ]
                case "/courses/[course]/divideAssignment/[divideAssignmentId]":
                    return [
                        { href: "/", name: "Courses" },
                        {
                            href: `/courses/${router.query.course}`,
                            name: router.query.course as string,
                        },
                        {
                            href: `/courses/${router.query.course}/divideAssignment`,
                            name: "DivideAssignment",
                        },
                        {
                            href: `/courses/${router.query.course}/divideAssignment/${router.query.divideAssignmentId}`,
                            name: router.query.divideAssignmentId as string,
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

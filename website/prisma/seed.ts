import { PrismaClient } from "@prisma/client"

async function main() {
    const db = new PrismaClient()

    const courses = [
        {
            name: "D7032E",
            title: "Software engineering",
            coursePage:
                "https://www.ltu.se/edu/course/D70/D7032E/D7032E-Programvaruteknik-1.112678",
            tablerIcon: "IconCode",
            description:
                "The course will have an emphasis on selected topics from: Project planning and management, problem analysis, software management and interpretation, code complexity, API design, debugging and testing, configuration management, documentation, design patterns, build support and tools of the trade, packaging, release management and deployment, modeling and structuring of software, reuse, components, architectures, maintenance and documentation. The course includes a number of assignments, which are to be completed in groups, and that are evaluated in both written and oral form. Individual examination is given through tests and a home exam.",
        },
        {
            name: "D0038E",
            title: "Artificial Intelligence and Pattern Recognition",
            coursePage:
                "https://www.ltu.se/edu/course/D00/D0038E/D0038E-Introduktion-till-AI-och-monsterigenkanning-1.225702",
            tablerIcon: "IconRobot",
            description:
                "This course delves deeper into the theory and mathematical methodology of subsymbolic AI methods for both machine learning and pattern recognition.",
        },
    ]
    for (const course of courses) {
        await db.course.upsert({
            where: { name: course.name },
            create: { ...course },
            update: { ...course },
        })
    }
}

main()

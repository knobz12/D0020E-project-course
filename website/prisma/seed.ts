import { PrismaClient } from "@prisma/client"

async function main() {
    const db = new PrismaClient()

    await db.course.createMany({
        data: [
            {
                name: "D7032E",
            },
            {
                name: "D0038E",
            },
        ],
    })
}

main()

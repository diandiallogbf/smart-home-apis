import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function test() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                language: true,
                isActive: true,
                createdAt: true,
            }
        });
        console.log(users);
    } catch (e) {
        console.error("DB Error:", e);
    }
}
test();

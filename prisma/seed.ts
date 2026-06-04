import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const personas = [
        {
            email: "aissatou@residence.com",
            firstName: "Aïssatou",
            lastName: "Camara",
            role: "ADMIN",
            mustChangePassword: false, // L'admin ne change pas son mdp pour le test
        },
        {
            email: "mariama@residence.com",
            firstName: "Mariama",
            lastName: "Camara",
            role: "FAMILY",
            mustChangePassword: true, // Pour tester le flux de redirection
        },
        {
            email: "mamadou@residence.com",
            firstName: "Mamadou",
            lastName: "Camara",
            role: "SENIOR",
            mustChangePassword: false,
        },
        {
            email: "sophie@residence.com",
            firstName: "Sophie",
            lastName: "Martin",
            role: "TENANT",
            mustChangePassword: true, // Autre test de redirection
        },
        {
            email: "fatou@residence.com",
            firstName: "Fatou",
            lastName: "Diallo",
            role: "STAFF",
            mustChangePassword: false,
        }
    ];

    console.log("Seeding personas...");

    for (const p of personas) {
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {},
            create: {
                firstName: p.firstName,
                lastName: p.lastName,
                email: p.email,
                passwordHash: passwordHash,
                role: p.role,
                language: "fr",
                isActive: true,
                mustChangePassword: p.mustChangePassword,
            },
        });
        console.log(`Seeded ${user.role}: ${user.email} (Password: password123)`);
    }

    console.log("Seeding rooms...");
    const rooms = [
        { name: "Porte Principale", description: "Entrée principale de la résidence" },
        { name: "Garage", description: "Parking intérieur" },
        { name: "Salon Commun", description: "Espace de vie partagé" },
        { name: "Local Technique", description: "Serveur et équipements réseau" }
    ];

    for (const r of rooms) {
        const room = await prisma.room.findFirst({ where: { name: r.name } });
        if (!room) {
            await prisma.room.create({ data: r });
            console.log(`Seeded room: ${r.name}`);
        }
    }

    console.log("Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("Error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

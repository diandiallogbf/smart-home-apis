import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export class UserRepository {
    constructor() {}

    async findAll() {
        return prisma.user.findMany({
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
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
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
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async create(data: Prisma.UserCreateInput) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
            }
        });
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
            }
        });
    }

    async delete(id: string) {
        return prisma.user.delete({
            where: { id }
        });
    }
}
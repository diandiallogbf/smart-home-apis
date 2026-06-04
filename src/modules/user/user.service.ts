import bcrypt from "bcrypt";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { UserRepository } from "./user.repository.js";
import { EmailService } from "../email/email.service.js";
import { ConflictError, NotFoundError } from "../../utils/error.util.js";

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService
    ) {}

    async getAllUsers() {
        return this.userRepository.findAll();
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("Utilisateur introuvable");
        }
        return user;
    }

    async createUser(data: Omit<Prisma.UserCreateInput, "passwordHash">) {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictError("Un utilisateur avec cet email existe déjà");
        }

        // Generate temporary password
        const tempPassword = crypto.randomBytes(6).toString("hex"); // e.g. "a1b2c3d4e5f6"
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        const userData: Prisma.UserCreateInput = {
            ...data,
            passwordHash,
        };

        const createdUser = await this.userRepository.create(userData);

        // Send email
        await this.emailService.sendTemporaryPassword(createdUser.email, tempPassword);

        return {
            user: createdUser,
            tempPassword, // Still returned for immediate view
        };
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("Utilisateur introuvable");
        }
        return this.userRepository.update(id, data);
    }

    async deleteUser(id: string) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("Utilisateur introuvable");
        }
        await this.userRepository.delete(id);
        return { success: true };
    }

    // --- SECURITY & ACCESS METHODS ---

    async getUserSecurityDetails(id: string) {
        // We use prisma directly here for complex includes, or we could add it to repository
        // Since we don't have a direct import of prisma in this file, let's import it.
        const { prisma } = await import("../../../lib/prisma.js");
        const details = await prisma.user.findUnique({
            where: { id },
            include: {
                rfidCards: true,
                biometricProfile: true,
                permissions: {
                    include: { room: true }
                }
            }
        });
        if (!details) throw new NotFoundError("Utilisateur introuvable");
        return details;
    }

    async addRfidCard(userId: string, uid: string) {
        const { prisma } = await import("../../../lib/prisma.js");
        const existing = await prisma.rfidCard.findUnique({ where: { uid } });
        if (existing) {
            throw new ConflictError("Cette carte RFID est déjà associée à un utilisateur.");
        }
        return prisma.rfidCard.create({
            data: { userId, uid }
        });
    }

    async deleteRfidCard(userId: string, uid: string) {
        const { prisma } = await import("../../../lib/prisma.js");
        const card = await prisma.rfidCard.findUnique({ where: { uid } });
        if (!card || card.userId !== userId) {
            throw new NotFoundError("Carte RFID introuvable pour cet utilisateur.");
        }
        await prisma.rfidCard.delete({ where: { uid } });
        return { success: true };
    }

    async updateBiometrics(userId: string, data: { faceEmbedding?: string, voiceEmbedding?: string }) {
        const { prisma } = await import("../../../lib/prisma.js");
        return prisma.biometricProfile.upsert({
            where: { userId },
            update: { 
                ...(data.faceEmbedding !== undefined && { faceEmbedding: data.faceEmbedding }),
                ...(data.voiceEmbedding !== undefined && { voiceEmbedding: data.voiceEmbedding })
            },
            create: {
                userId,
                faceEmbedding: data.faceEmbedding,
                voiceEmbedding: data.voiceEmbedding
            }
        });
    }

    async updatePermissions(userId: string, permissions: Array<{ roomId: string, canAccess: boolean, startHour?: number, endHour?: number }>) {
        const { prisma } = await import("../../../lib/prisma.js");
        
        // Transaction to clear and recreate
        await prisma.$transaction(async (tx) => {
            await tx.userPermission.deleteMany({ where: { userId } });
            
            if (permissions.length > 0) {
                await tx.userPermission.createMany({
                    data: permissions.map(p => ({
                        userId,
                        roomId: p.roomId,
                        canAccess: p.canAccess,
                        startHour: p.startHour || null,
                        endHour: p.endHour || null,
                    }))
                });
            }
        });

        return { success: true };
    }

    async getAccessProfiles() {
        const { prisma } = await import("../../../lib/prisma.js");
        return prisma.user.findMany({
            include: {
                biometricProfile: true,
                rfidCards: true,
                permissions: true,
            }
        });
    }

    async getAccessLogs() {
        const { prisma } = await import("../../../lib/prisma.js");
        return prisma.accessLog.findMany({
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });
    }
}

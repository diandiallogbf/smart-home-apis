import speakeasy from 'speakeasy';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from "../../../lib/prisma.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../utils/error.util.js";
import { JWTUtil } from "../../utils/jwt.util.js";

export class AuthService {
    constructor() { }

    async login(
        email: string, password: string, deviceInfo?: string, ipAddress?: string
    ): Promise<any> {

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user)
            throw new
                UnauthorizedError("Les informations de connexion sont incorrectes. Veuillez réessayer.");

        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid)
            throw new ForbiddenError("Les informations de connexion sont incorrectes. Veuillez réessayer.");


        const tokens = await this.generateTokens(
            user.id,
            deviceInfo,
            ipAddress
        );

        return { 
            user, 
            ...tokens,
            mustChangePassword: user.mustChangePassword 
        };
    }

    async refresh(
        refreshToken: string, deviceInfo?: string, ipAddress?: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = JWTUtil.verifyRefreshToken(refreshToken);

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: true
            },
        });

        if (!storedToken || storedToken.revoked) {
            throw new ForbiddenError('Invalid refresh token');
        }

        if (storedToken.expiresAt < new Date()) {
            throw new ForbiddenError('Refresh token expired');
        }

        const tokens = await this.generateTokens(
            storedToken.userId,
            deviceInfo,
            ipAddress
        );

        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true, revokedAt: new Date() },
        });

        return tokens;
    }

    async logout(refreshToken: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked: true, revokedAt: new Date() },
        });
    }

    private async generateTokens(
        userId: string, deviceInfo?: string, ipAddress?: string
    ): Promise<{ accessToken: string; refreshToken: string }> {

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) throw new NotFoundError('User not found');

        // Generate access token
        const accessToken = JWTUtil.generateAccessToken({
            userId: user.id,
            email: user.email,
            tokenVersion: 1 //user.tokenVersion
        });

        const refreshTokenId = crypto.randomUUID();
        const refreshToken = JWTUtil.generateRefreshToken({
            userId: user.id,
            tokenId: refreshTokenId,
        });

        await prisma.refreshToken.create({
            data: {
                id: refreshTokenId,
                userId: user.id,
                token: refreshToken,
                deviceInfo,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return { accessToken, refreshToken };
    }

    async getUserById(userId: string): Promise<any> {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundError('Aucun compte ne correspond à ces informations.');
        }

        const { passwordHash, ...safeUser } = user;

        return safeUser;
    }

    async changePassword(userId: string, newPassword: string): Promise<void> {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { 
                passwordHash,
                mustChangePassword: false 
            }
        });
    }
}
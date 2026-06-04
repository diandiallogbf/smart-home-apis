import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { jwtConfig } from '../config/jwt.js';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt.types.js';


const accessTokenOptions: SignOptions = {
    algorithm: jwtConfig.accessToken.algorithm,  // RS256
    expiresIn: "15m" as const,
};

const refreshTokenOptions: SignOptions = {
    algorithm: "HS256",  // ← secret simple = HS256
    expiresIn: jwtConfig.refreshToken.expiresIn as any,
};

export class JWTUtil {

    static generateAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, jwtConfig.accessToken.privateKey as Secret, accessTokenOptions);
    }

    static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, jwtConfig.refreshToken.secret as Secret, refreshTokenOptions);
    }

    static verifyAccessToken(token: string): AccessTokenPayload {
        return jwt.verify(token, jwtConfig.accessToken.publicKey as Secret, {
            algorithms: [jwtConfig.accessToken.algorithm],
        }) as AccessTokenPayload;
    }

    static verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, jwtConfig.refreshToken.secret, {
            algorithms: ["HS256"],
        }) as RefreshTokenPayload;
    }

    static decodeToken(token: string): any {
        return jwt.decode(token);
    }
}
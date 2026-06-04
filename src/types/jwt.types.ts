export interface AccessTokenPayload {
    userId: string;
    email: string;
    tokenVersion: number;
    iat: number;
    exp: number;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat: number;
    exp: number;
}
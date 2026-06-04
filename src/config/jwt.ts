import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const jwtConfig = {
    accessToken: {
        privateKey: fs.readFileSync(
            path.join(__dirname, '../../keys/private.key'),
            'utf8'
        ),
        publicKey: fs.readFileSync(
            path.join(__dirname, '../../keys/public.key'),
            'utf8'
        ),
        algorithm: 'RS256' as const,
        expiresIn: '15m',
    },
    refreshToken: {
        secret: config.jwt.refreshSecret,
        expiresIn: config.jwt.refreshExpiresIn,
    },
};
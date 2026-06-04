import { z } from 'zod';

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    SERVICE_NAME: z.string().default('smart-home-api'),

    DATABASE_URL: z.string().default(""),

    REDIS_URL: z.string().default('redis://localhost:6379'),
    REDIS_PASSWORD: z.string().optional(),

    JWT_ACCESS_SECRET: z.string().default('20fbda5a-7aa5-4005-92d0-0ccbb24dd04a'),
    JWT_REFRESH_SECRET: z.string().default('39cbc642-bc78-42d4-820e-fc286dcc7887'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

    CORS_ORIGIN: z.string().default('*'),

    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

    USER_SERVICE_URL: z.string().optional(),
    NOTIFICATION_SERVICE_URL: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
    app: {
        env: env.NODE_ENV,
        port: parseInt(env.PORT),
        serviceName: env.SERVICE_NAME,
    },

    database: {
        url: env.DATABASE_URL,
    },

    redis: {
        url: env.REDIS_URL,
        password: env.REDIS_PASSWORD,
    },

    jwt: {
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },

    rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS),
    },

    cors: {
        origin: env.CORS_ORIGIN,
    },

    logging: {
        level: env.LOG_LEVEL,
    },

    services: {
        auth: env.USER_SERVICE_URL,
        notification: env.NOTIFICATION_SERVICE_URL,
    },
} as const;
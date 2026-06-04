import { rateLimit } from 'express-rate-limit';
import { config } from '../config/env.js';

export const rateLimitMiddleware = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const strictRateLimitMiddleware = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authRateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Trop de tentatives de connexion ont été effectuées. Veuillez patienter quelques minutes avant de réessayer.',
    standardHeaders: true,
    legacyHeaders: false,
});
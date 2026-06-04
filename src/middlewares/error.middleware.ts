import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util.js';
import { AppError } from '../utils/error.util.js';
import { ResponseUtil } from '../utils/response.util.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    logger.error('Error handler caught error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    if (error instanceof AppError) {
        return ResponseUtil.error(
            res,
            error.message,
            error.statusCode,
            error.constructor.name
        );
    }

    // Erreur Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            const targets = error.meta?.target as string[] | undefined;

            if (targets?.includes("email")) {
                return ResponseUtil.conflict(res, "Email déjà utilisé");
            }

            if (targets?.includes("phone")) {
                return ResponseUtil.conflict(res, "Numéro déjà utilisé");
            }

            return ResponseUtil.conflict(res, "Donnée déjà existante");
        }

        return ResponseUtil.error(res, "Erreur base de données", 500);
    }

    // Erreur de validation Zod
    if (error.name === 'ZodError') {
        return ResponseUtil.badRequest(res, 'Erreur de validation');
    }

    // Erreurs JWT
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
        return ResponseUtil.error(res, 'Jeton invalide ou expiré', 401, 'UnauthorizedError');
    }

    // Erreur inconnue
    return ResponseUtil.internalError(res, error.message || 'Erreur inconnue');
};

export const notFoundHandler = (req: Request, res: Response) => {
    return ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};

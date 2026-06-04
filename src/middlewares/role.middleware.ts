import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/error.util.js";

export const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                throw new ForbiddenError("Accès refusé. Utilisateur non authentifié.");
            }

            if (!allowedRoles.includes(user.role)) {
                throw new ForbiddenError("Accès refusé. Vous n'avez pas les permissions nécessaires.");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

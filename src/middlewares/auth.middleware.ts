import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util.js';
import { UnauthorizedError } from '../utils/error.util.js';
import { UserRepository } from '../modules/user/user.repository.js';

export class AuthMiddleware {
    constructor(private userRepo: UserRepository) { }

    authenticate = async (req: any, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('No token provided');
            }

            const token = authHeader.substring(7);
            const payload = JWTUtil.verifyAccessToken(token);

            const user = await this.userRepo.findById(payload.userId);
            if (!user) {
                throw new UnauthorizedError('User not found');
            }

            req.user = user;
            req.userId = user.id;

            next();
        } catch (error) {
            console.log(error)
        }
    };

    optionalAuth = async (req: any, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const payload = JWTUtil.verifyAccessToken(token);
                const user = await this.userRepo.findById(payload.userId);

                if (user && user.status === 'ACTIVE') {
                    req.user = user;
                    req.userId = user.id;
                }
            }

            next();
        } catch (error) {
            next();
        }
    };
}

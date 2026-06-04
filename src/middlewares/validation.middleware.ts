import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ResponseUtil } from '../utils/response.util.js';
import { logger } from '../utils/logger.util.js';

export class ValidationMiddleware {
    static validate(schema: ZodObject) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));

                    logger.warn('Validation error', { errors });

                    return ResponseUtil.badRequest(res, 'Validation failed', errors);
                }

                logger.error('Unexpected validation error', { error });
                return ResponseUtil.internalError(res);
            }
        };
    }

    static validateBody(schema: ZodObject) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = await schema.parseAsync(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));

                    return ResponseUtil.badRequest(res, 'Validation failed', errors);
                }

                return ResponseUtil.internalError(res);
            }
        };
    }

    static validateQuery(schema: ZodObject) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                req.query = await schema.parseAsync(req.query);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));

                    return ResponseUtil.badRequest(res, 'Validation failed', errors);
                }

                return ResponseUtil.internalError(res);
            }
        };
    }

    static validateParams(schema: ZodObject) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                req.params = await schema.parseAsync(req.params);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.issues.map((err) => ({
                        path: err.path.join('.'),
                        message: err.message,
                    }));

                    return ResponseUtil.badRequest(res, 'Validation failed', errors);
                }

                return ResponseUtil.internalError(res);
            }
        };
    }
}
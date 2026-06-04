import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {

                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: "Certaines informations saisies ne sont pas valides. Veuillez vérifier les champs et réessayer.",
                    details: errors,
                });
            }

            // Erreur inattendue
            return res.status(500).json({
                success: false,
                error: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard ou contacter le support si le problème persiste.",
            });
        }
    };
};

/**
 * Validation pour les query params
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Query validation failed',
                    details: errors,
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    };
};

/**
 * Validation pour les params de route
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));

                return res.status(400).json({
                    success: false,
                    error: 'Params validation failed',
                    details: errors,
                });
            }

            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    };
};

/**
 * Validation combinée (body + query + params)
 */
export const validateAll = (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors: any[] = [];

            // Valider le body si schéma fourni
            if (schemas.body) {
                try {
                    await schemas.body.parseAsync(req.body);
                } catch (error) {
                    if (error instanceof ZodError) {
                        errors.push(
                            ...error.issues.map((err) => ({
                                location: 'body',
                                field: err.path.join('.'),
                                message: err.message,
                                code: err.code,
                            }))
                        );
                    }
                }
            }

            // Valider query si schéma fourni
            if (schemas.query) {
                try {
                    await schemas.query.parseAsync(req.query);
                } catch (error) {
                    if (error instanceof ZodError) {
                        errors.push(
                            ...error.issues.map((err) => ({
                                location: 'query',
                                field: err.path.join('.'),
                                message: err.message,
                                code: err.code,
                            }))
                        );
                    }
                }
            }

            // Valider params si schéma fourni
            if (schemas.params) {
                try {
                    await schemas.params.parseAsync(req.params);
                } catch (error) {
                    if (error instanceof ZodError) {
                        errors.push(
                            ...error.issues.map((err) => ({
                                location: 'params',
                                field: err.path.join('.'),
                                message: err.message,
                                code: err.code,
                            }))
                        );
                    }
                }
            }

            // Si erreurs détectées, retourner 400
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors,
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    };
};

/**
 * Sanitize helper - nettoie les strings des espaces inutiles
 */
export const sanitizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
};
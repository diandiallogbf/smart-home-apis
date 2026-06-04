import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util.js';
import { logger } from '../utils/logger.util.js';
import { RoleService } from '../modules/role/role.service.js';

export class RBACMiddleware {
    constructor(private roleService: RoleService) { }

    // Middleware pour vérifier une permission
    requirePermission(permission: string, scope?: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const userId = req.user?.id || req.userId;

                if (!userId) {
                    return ResponseUtil.unauthorized(res, 'User not authenticated');
                }

                // Utiliser le scope de la requête si fourni
                const effectiveScope = scope || (req.params.scope as string) || undefined;

                const hasPermission = await this.roleService.hasPermission(
                    userId,
                    permission,
                    effectiveScope
                );

                if (!hasPermission) {
                    logger.warn('Permission denied', {
                        userId,
                        permission,
                        scope: effectiveScope,
                    });
                    return ResponseUtil.forbidden(
                        res,
                        `Permission ${permission} required`
                    );
                }

                next();
            } catch (error) {
                logger.error('Permission check error', { error, permission });
                return ResponseUtil.internalError(res);
            }
        };
    }

    // Middleware pour vérifier un rôle
    requireRole(roleName: string, scope?: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const userId = req.user?.id || req.userId;

                if (!userId) {
                    return ResponseUtil.unauthorized(res, 'User not authenticated');
                }

                const effectiveScope = scope || (req.params.scope as string) || undefined;

                const hasRole = await this.roleService.hasRole(
                    userId,
                    roleName,
                    effectiveScope
                );

                if (!hasRole) {
                    logger.warn('Role check failed', {
                        userId,
                        roleName,
                        scope: effectiveScope,
                    });
                    return ResponseUtil.forbidden(res, `Role ${roleName} required`);
                }

                next();
            } catch (error) {
                logger.error('Role check error', { error, roleName });
                return ResponseUtil.internalError(res);
            }
        };
    }

    // Middleware pour vérifier plusieurs permissions (au moins une)
    requireAnyPermission(permissions: string[], scope?: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const userId = req.user?.id || req.userId;

                if (!userId) {
                    return ResponseUtil.unauthorized(res, 'User not authenticated');
                }

                const effectiveScope = scope || (req.params.scope as string) || undefined;

                const hasAnyPermission = await this.roleService.hasPermissions(
                    userId,
                    permissions,
                    effectiveScope,
                    false // requireAll = false
                );

                if (!hasAnyPermission) {
                    logger.warn('No required permissions found', {
                        userId,
                        permissions,
                        scope: effectiveScope,
                    });
                    return ResponseUtil.forbidden(
                        res,
                        `One of these permissions required: ${permissions.join(', ')}`
                    );
                }

                next();
            } catch (error) {
                logger.error('Permissions check error', { error, permissions });
                return ResponseUtil.internalError(res);
            }
        };
    }

    // Middleware pour vérifier toutes les permissions
    requireAllPermissions(permissions: string[], scope?: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const userId = req.user?.id || req.userId;

                if (!userId) {
                    return ResponseUtil.unauthorized(res, 'User not authenticated');
                }

                const effectiveScope = scope || (req.params.scope as string) || undefined;

                const hasAllPermissions = await this.roleService.hasPermissions(
                    userId,
                    permissions,
                    effectiveScope,
                    true // requireAll = true
                );

                if (!hasAllPermissions) {
                    logger.warn('Missing required permissions', {
                        userId,
                        permissions,
                        scope: effectiveScope,
                    });
                    return ResponseUtil.forbidden(
                        res,
                        `All of these permissions required: ${permissions.join(', ')}`
                    );
                }

                next();
            } catch (error) {
                logger.error('All permissions check error', { error, permissions });
                return ResponseUtil.internalError(res);
            }
        };
    }

    // Middleware pour vérifier que l'utilisateur ne peut modifier que ses propres données
    requireSelfOrPermission(permission: string) {
        return async (req: any, res: Response, next: NextFunction) => {
            try {
                const userId = req.user?.id || req.userId;
                const targetUserId = req.params.userId || req.params.id;

                if (!userId) {
                    return ResponseUtil.unauthorized(res, 'User not authenticated');
                }

                // Si c'est son propre profil, autoriser
                if (userId === targetUserId) {
                    return next();
                }

                // Sinon, vérifier la permission
                const hasPermission = await this.roleService.hasPermission(
                    userId,
                    permission
                );

                if (!hasPermission) {
                    logger.warn('Self or permission check failed', {
                        userId,
                        targetUserId,
                        permission,
                    });
                    return ResponseUtil.forbidden(
                        res,
                        'You can only modify your own data or have the required permission'
                    );
                }

                next();
            } catch (error) {
                logger.error('Self or permission check error', { error, permission });
                return ResponseUtil.internalError(res);
            }
        };
    }
}
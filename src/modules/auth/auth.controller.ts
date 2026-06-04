import { NextFunction, Response, Request } from "express";
import { ResponseUtil } from "../../utils/response.util.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { email, password, rememberMe } = req.body;

            const deviceInfo = req.headers['user-agent'];
            const ipAddress = req.ip || req.socket.remoteAddress;

            const result = await this.authService.login(
                email,
                password,
                deviceInfo,
                ipAddress
            );

            // Si 2FA activé
            if (result.require2FA) {
                return ResponseUtil.success(res, {
                    require2FA: true,
                    tempToken: result.tempToken,
                });
            }

            return ResponseUtil.success(res, {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    role: result.user.role,
                    language: result.user.language,
                },
                mustChangePassword: result.mustChangePassword,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            });
        } catch (error: any) {
            console.log(error);
            next(error)
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { refreshToken } = req.body;

            const deviceInfo = req.headers['user-agent'];
            const ipAddress = req.ip || req.socket.remoteAddress;

            const result = await this.authService.refresh(
                refreshToken,
                deviceInfo,
                ipAddress
            );

            return ResponseUtil.success(res, {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            });

        } catch (error: any) {
            console.log(error);
            return ResponseUtil.error(res, error.message);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const { refreshToken } = req.body;

            await this.authService.logout(refreshToken);

            return ResponseUtil.success(res, {})
        } catch (error: any) {
            return ResponseUtil.error(res, error.message);
        }
    };

    getProfile = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const userId = req.user!.id;

            const user: any = await this.authService.getUserById(userId);

            return ResponseUtil.success(res, user);
        } catch (error: any) {
            console.log(error);
            return ResponseUtil.error(res, error.message);
        }
    };

    changePassword = async (req: any, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const userId = req.user!.id;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return ResponseUtil.error(res, "Le mot de passe doit faire au moins 6 caractères.", 400);
            }

            await this.authService.changePassword(userId, newPassword);

            return ResponseUtil.success(res, { message: "Mot de passe mis à jour avec succès." });
        } catch (error: any) {
            console.log(error);
            return ResponseUtil.error(res, error.message);
        }
    };
}
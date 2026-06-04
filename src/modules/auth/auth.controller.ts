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
                user: result.user,
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
}
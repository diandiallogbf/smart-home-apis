import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { AuthController } from "./auth.controller.js";

export const createAuthRoutes = (
    authMiddleware: AuthMiddleware,
    authController: AuthController
) => {
    const router = Router();
    
    router.post(
        '/login',
        authController.login
    );

    router.post(
        '/refresh',
        authController.refresh
    );

    router.post(
        '/logout',
        authController.logout
    );

    router.get(
        '/me',
        authMiddleware.authenticate,
        authController.getProfile
    );

    return router;
}
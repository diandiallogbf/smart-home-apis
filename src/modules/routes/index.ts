import { Router } from "express"
import { createAuthRoutes } from "../auth/auth.routes.js";
import { createUserRoutes } from "../user/user.routes.js";

export const createRoutes = (
) => {
    const router = Router();

    router.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            service: 'smart-home-api',
            timestamp: new Date().toISOString(),
        })
    });

    router.use(
        '/auth',
        createAuthRoutes(
        )
    );

    router.use(
        '/users',
        createUserRoutes(
        )
    );

    return router;
}
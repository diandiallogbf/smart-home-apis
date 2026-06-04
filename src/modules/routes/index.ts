import { Router } from "express"
import { createAuthRoutes } from "../auth/auth.routes.js";
import { createUserRoutes } from "../user/user.routes.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { AuthController } from "../auth/auth.controller.js";
import { UserController } from "../user/user.controller.js";
import { createRoomRoutes } from "../room/room.routes.js";
import { RoomController } from "../room/room.controller.js";

export const createRoutes = (
    authMiddleware: AuthMiddleware,
    authController: AuthController,
    userController: UserController,
    roomController: RoomController
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
            authMiddleware,
            authController
        )
    );

    router.use(
        '/users',
        createUserRoutes(
            authMiddleware,
            userController
        )
    );

    router.use(
        '/rooms',
        createRoomRoutes(
            authMiddleware,
            roomController
        )
    );

    return router;
}
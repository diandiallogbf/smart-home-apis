import { Router } from "express";
import { RoomController } from "./room.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";

export const createRoomRoutes = (
    authMiddleware: AuthMiddleware,
    roomController: RoomController
) => {
    const router = Router();
    router.use(authMiddleware.authenticate);
    router.get("/", roomController.getAllRooms);
    return router;
}

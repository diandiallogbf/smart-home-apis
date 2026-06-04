import { Router } from "express";
import { UserController } from "./user.controller.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

export const createUserRoutes = (
    authMiddleware: AuthMiddleware,
    userController: UserController
) => {
    const router = Router();

    // All user routes require authentication and ADMIN role
    router.use(authMiddleware.authenticate);
    router.use(requireRole(["ADMIN"]));

    router.get("/", userController.getAllUsers);
    router.get("/access-profiles", userController.getAccessProfiles);
    router.get("/access-logs", userController.getAccessLogs);
    router.get("/:id", userController.getUserById);
    router.post("/", userController.createUser);
    router.put("/:id", userController.updateUser);
    router.delete("/:id", userController.deleteUser);
    
    // Security & Access routes
    router.get("/:id/security", userController.getUserSecurityDetails);
    router.post("/:id/rfid", userController.addRfidCard);
    router.delete("/:id/rfid/:uid", userController.deleteRfidCard);
    router.post("/:id/biometrics", userController.updateBiometrics);
    router.put("/:id/permissions", userController.updatePermissions);

    return router;
}
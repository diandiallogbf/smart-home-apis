import { NextFunction, Request, Response } from "express";
import { ResponseUtil } from "../../utils/response.util.js";
import { UserService } from "./user.service.js";

export class UserController {
    constructor(private userService: UserService) {}

    getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = await this.userService.getAllUsers();
            ResponseUtil.success(res, users);
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            ResponseUtil.success(res, user);
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.createUser(req.body);
            ResponseUtil.success(res, result, 201);
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            ResponseUtil.success(res, user);
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.deleteUser(req.params.id);
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    getUserSecurityDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.getUserSecurityDetails(req.params.id);
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    addRfidCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { uid } = req.body;
            const result = await this.userService.addRfidCard(req.params.id, uid);
            ResponseUtil.success(res, result, 201);
        } catch (error) {
            next(error);
        }
    };

    deleteRfidCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { uid } = req.params;
            const result = await this.userService.deleteRfidCard(req.params.id, uid);
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    updateBiometrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.updateBiometrics(req.params.id, req.body);
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    updatePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { permissions } = req.body;
            const result = await this.userService.updatePermissions(req.params.id, permissions);
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    getAccessProfiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.getAccessProfiles();
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };

    getAccessLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.userService.getAccessLogs();
            ResponseUtil.success(res, result);
        } catch (error) {
            next(error);
        }
    };
}

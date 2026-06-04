import { Request, Response, NextFunction } from "express";
import { ResponseUtil } from "../../utils/response.util.js";
import { RoomService } from "./room.service.js";

export class RoomController {
    constructor(private roomService: RoomService) {}

    getAllRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const rooms = await this.roomService.getAllRooms();
            ResponseUtil.success(res, rooms);
        } catch (error) {
            next(error);
        }
    };
}

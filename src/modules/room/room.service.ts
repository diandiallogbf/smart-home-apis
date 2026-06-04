import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export class RoomService {
    async getAllRooms() {
        return prisma.room.findMany();
    }
}

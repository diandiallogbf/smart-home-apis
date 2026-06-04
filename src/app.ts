import express, { Application } from "express";
import { config } from "./config/env.js";
import cors from 'cors';
import helmet from "helmet";
import morgan from "morgan";
import logger from "./utils/logger.util.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import { createRoutes } from "./modules/routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { UserRepository } from "./modules/user/user.repository.js";
import { UserService } from "./modules/user/user.service.js";
import { UserController } from "./modules/user/user.controller.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { EmailService } from "./modules/email/email.service.js";
import { RoomService } from "./modules/room/room.service.js";
import { RoomController } from "./modules/room/room.controller.js";


export class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares() {
        if (config.app.env === "development") {
            const allowedOrigins = config.cors.origin?.split(",") || [];
            this.app.use(
                cors({
                    origin: (origin, callback) => {
                        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
                            callback(null, true);
                        } else {
                            callback(new Error("Not allowed by CORS"));
                        }
                    },
                    credentials: true,
                })
            );
        }

        this.app.use(helmet());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        if (config.app.env === 'development') {
            this.app.use(morgan('dev'));
        } else {
            this.app.use(morgan('combined'));
        }

        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('user-agent'),
            });
            next();
        });
    }

    private initializeRoutes() {
        // initialize repositories
        const userRepo = new UserRepository();

        // initialize services
        const emailService = new EmailService();
        const authService = new AuthService();
        const userService = new UserService(userRepo, emailService);

        // initialize controllers
        const authController = new AuthController(authService);
        const userController = new UserController(userService);
        const roomService = new RoomService();
        const roomController = new RoomController(roomService);

        // initialize middlewares
        const authMiddleware = new AuthMiddleware(userRepo);

        const router = createRoutes(
            authMiddleware,
            authController,
            userController,
            roomController
        );

        this.app.use('/api/v1', router);
    }

    private initializeErrorHandling(): void {
        this.app.use(notFoundHandler);
        this.app.use(errorHandler);
    }
}
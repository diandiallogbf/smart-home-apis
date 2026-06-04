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
                        if (!origin || allowedOrigins.includes(origin)) {
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

        // initialize controllers

        // initialize middlewares
        const authMiddleware = new AuthMiddleware(userRepo);

        const router = createRoutes(
        );

        this.app.use('/api/v1', router);
    }

    private initializeErrorHandling(): void {
        this.app.use(notFoundHandler);
        this.app.use(errorHandler);
    }
}
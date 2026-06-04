import { prisma } from "../lib/prisma.js";
import { App } from "./app.js";
import { config } from "./config/env.js";
import logger from "./utils/logger.util.js";

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { UserRepository } from "./modules/user/user.repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

class Server {
    private app: App;

    constructor() {
        this.app = new App();
    }

    async start(): Promise<void> {
        await this.connectdb();

        const userRepo = new UserRepository();

        const server = this.app.app.listen(config.app.port, () => {
            logger.info(
                `#=== [Smart Home APIs] ecoute ecoute sur le port ${config.app.port} en mode ${config.app.env}`
            );
        });

        this.setupGracefulShutdown(server);
    }

    private async connectdb(): Promise<void> {
        try {
            await prisma.$connect();
            logger.info('# Database connected');
        } catch (error) {
            logger.error('# Database connection failed', { error });
            throw error;
        }
    }

    private setupGracefulShutdown(server: any): void {
        const shutdown = async (signal: string) => {
            logger.info(`${signal} reçu, arrêt du service en cours...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await prisma.$disconnect();
                    logger.info('Database disconnected');

                    logger.info('Extinction du service terminée');
                    process.exit(0);
                } catch (error) {
                    logger.error('Une erreur est survenue lors de l’arrêt du service', { error });
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Délai dépassé, arrêt forcé du service');
                process.exit(1);
            }, 30000);

            process.on('SIGTERM', () => shutdown('SIGTERM'));
            process.on('SIGINT', () => shutdown('SIGINT'));

            process.on('uncaughtException', (error) => {
                logger.error('Uncaught Exception', { error });
                process.exit(1);
            });

            process.on('unhandledRejection', (reason, promise) => {
                logger.error('Unhandled Rejection', { reason, promise });
                process.exit(1);
            });
        }
    }
}

const server = new Server();

server.start();

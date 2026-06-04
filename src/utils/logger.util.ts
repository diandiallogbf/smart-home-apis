import winston from 'winston';
import { config } from '../config/env.js';

const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        let msg = `${timestamp} [${level.toUpperCase()}] [${service}]: ${message}`;

        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }

        return msg;
    })
);

export const logger = winston.createLogger({
    level: config.logging.level,
    defaultMeta: { service: config.app.serviceName },
    format: customFormat,
    transports: [
        new winston.transports.Console({
            format: config.app.env === 'development'
                ? winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
                : customFormat,
        }),
    ],
});

// Si on est en production, on peut ajouter d'autres transports
if (config.app.env === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    );
}

export default logger;
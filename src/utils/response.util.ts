import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

export class ResponseUtil {
    static success<T>(res: Response, data: T, statusCode: number = 200): Response {
        const response: ApiResponse<T> = {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
            },
        };

        return res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T): Response {
        return this.success(res, data, 201);
    }

    static noContent(res: Response): Response {
        return res.status(204).send();
    }

    static error(
        res: Response,
        message: string,
        statusCode: number = 500,
        code?: string,
        details?: any
    ): Response {
        const response: ApiResponse = {
            success: false,
            error: {
                message,
                code,
                details,
            },
            meta: {
                timestamp: new Date().toISOString(),
            },
        };

        return res.status(statusCode).json(response);
    }

    static badRequest(res: Response, message: string, details?: any): Response {
        return this.error(res, message, 400, 'BAD_REQUEST', details);
    }

    static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
        return this.error(res, message, 401, 'UNAUTHORIZED');
    }

    static forbidden(res: Response, message: string = 'Forbidden'): Response {
        return this.error(res, message, 403, 'FORBIDDEN');
    }

    static notFound(res: Response, message: string = 'Resource not found'): Response {
        return this.error(res, message, 404, 'NOT_FOUND');
    }

    static conflict(res: Response, message: string = 'Resource already exists'): Response {
        return this.error(res, message, 409, 'CONFLICT');
    }

    static internalError(res: Response, message: string = 'Internal server error'): Response {
        return this.error(res, message, 500, 'INTERNAL_ERROR');
    }
}
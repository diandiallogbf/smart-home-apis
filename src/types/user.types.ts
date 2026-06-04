import { User, UserStatus, UserType } from "@prisma/client";

export interface CreateUserDTO {
    id?: string;
    email: string;
    phone?: string;
    type: UserType;
    firstName: string;
    lastName: string;
}

export interface UpdateUserDTO {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    locale?: string;
    timezone?: string;
    bio?: string;
}

export interface UserWithProfile extends User {
    profile?: {
        firstName?: string | null;
        lastName?: string | null;
        avatar?: string | null;
        locale: string;
        timezone: string;
        bio?: string | null;
    } | null;
}

export interface UserListParams {
    page?: number;
    limit?: number;
    type?: UserType;
    status?: UserStatus;
    search?: string;
}

export interface UserListResponse {
    users: UserWithProfile[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
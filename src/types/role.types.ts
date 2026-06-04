import { Permission, Role } from "@prisma/client";

export interface CreateRoleDTO {
    name: string;
    description?: string;
    isSystem?: boolean;
    permissions?: string[]; // Array of permission names
}

export interface UpdateRoleDTO {
    name?: string;
    description?: string;
    permissions?: string[];
}

export interface AssignRoleDTO {
    userId: string;
    roleId: string;
    scope?: string; // organization_id or null for global
    grantedBy?: string;
    expiresAt?: Date;
}

export interface RoleWithPermissions extends Role {
    permissions: Array<{
        permission: Permission;
    }>;
}

export interface PermissionValidationRequest {
    userId: string;
    permission: string;
    scope?: string;
}

export interface RoleValidationRequest {
    userId: string;
    role: string;
    scope?: string;
}

export interface BatchPermissionValidationRequest {
    userId: string;
    permissions: string[];
    scope?: string;
    requireAll?: boolean;
}

export interface ValidationResponse {
    valid: boolean;
    userId: string;
    permission?: string;
    role?: string;
    permissions?: string[];
    scope?: string;
}
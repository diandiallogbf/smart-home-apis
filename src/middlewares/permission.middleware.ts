import { Request, Response, NextFunction } from 'express';
import { MemberRepository } from '../modules/member/member.repository.js';
import { ValidationError } from '../utils/error.util.js';
import { MemberRole } from '@prisma/client';

export const requireOrganizationRole = (allowedRoles: MemberRole[]) => {
    return async (req: any, res: Response, next: NextFunction) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user!.id;

            const memberRepo = new MemberRepository();
            const member = await memberRepo.findByUserAndOrganization(userId, organizationId as string);

            if (!member || !allowedRoles.includes(member.role)) {
                throw new ValidationError('Insufficient permissions');
            }

            // Ajouter le member au request pour utilisation ultérieure
            req.app.locals.currentMember = member;

            next();
        } catch (error) {
            next(error);
        }
    };
};
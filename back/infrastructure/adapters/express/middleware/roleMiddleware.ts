import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import { UserRole } from '@avenir/shared/enums/UserRole';

export const createRoleMiddleware = (userRepository: UserRepository, ...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Utilisateur non authentifié',
                });
            }

            const user = await userRepository.getById(req.user.userId);

            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Utilisateur introuvable',
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'Accès refusé. Rôle DIRECTOR requis.',
                });
            }

            (req.user as any).role = user.role;
            next();
        } catch (error) {
            console.error('Error in role middleware:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Erreur lors de la vérification du rôle',
            });
        }
    };
};

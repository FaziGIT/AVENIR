import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import { UserRole } from '@avenir/shared/enums/UserRole';

export const createRoleMiddleware = (userRepository: UserRepository, ...allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Utilisateur non authentifié',
        });
      }

      const user = await userRepository.getById(request.user.userId);

      if (!user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Utilisateur introuvable',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Accès refusé. Rôle DIRECTOR requis.',
        });
      }

      (request.user as any).role = user.role;
    } catch (error) {
      console.error('Error in role middleware:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Erreur lors de la vérification du rôle',
      });
    }
  };
};

import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { AccountController } from '../controllers/AccountController';
import { AddAccountRequest } from '@avenir/application/requests';
import { authMiddleware } from '../middleware/authMiddleware';

export async function accountRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { accountController: AccountController }
) {
    const { accountController } = options;

    fastify.get<{ Querystring: { userId: string } }>('/accounts', { preHandler: authMiddleware }, async (request, reply) => {
        return accountController.getAccounts(request, reply);
    });

    fastify.post<{ Body: AddAccountRequest }>('/accounts', { preHandler: authMiddleware }, async (request, reply) => {
        return accountController.addAccount(request, reply);
    });

    fastify.delete<{ Params: { id: string } }>('/accounts/:id', { preHandler: authMiddleware }, async (request, reply) => {
        return accountController.deleteAccount(request, reply);
    });

    fastify.patch<{ Params: { id: string }; Body: { name: string | null } }>('/accounts/:id/name', { preHandler: authMiddleware }, async (request, reply) => {
        return accountController.updateAccountName(request, reply);
    });
}


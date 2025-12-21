import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../controllers/UserController';
import { AddUserRequest } from '../../../../application/requests';

export async function userRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { userController: UserController }
) {
    const { userController } = options;

    fastify.get('/users', async (request: FastifyRequest<{ Querystring: { role?: string } }>, reply: FastifyReply) => {
        return userController.getUsers(request, reply);
    });

    fastify.get('/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        return userController.getUser(request, reply);
    });

    fastify.post('/users', async (request: FastifyRequest<{ Body: AddUserRequest }>, reply: FastifyReply) => {
        return userController.addUser(request, reply);
    });
}


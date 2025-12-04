import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../controllers/UserController';
import { AddUserInput } from '../../../../application/usecases/user/AddUserUseCase';

export async function userRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { userController: UserController }
) {
    const { userController } = options;

    fastify.get('/users/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        return userController.getUser(request, reply);
    });

    fastify.post('/users', async (request: FastifyRequest<{ Body: AddUserInput }>, reply: FastifyReply) => {
        return userController.addUser(request, reply);
    });
}


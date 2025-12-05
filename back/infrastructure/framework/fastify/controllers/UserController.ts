import { FastifyRequest, FastifyReply } from 'fastify';
import { GetUserUseCase } from '../../../../application/usecases/user/GetUserUseCase';
import { AddUserUseCase, AddUserInput } from '../../../../application/usecases/user/AddUserUseCase';

export class UserController {
    constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly addUserUseCase: AddUserUseCase,
    ) {}

    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const user = await this.getUserUseCase.execute(id);

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            return reply.code(200).send(user);
        } catch (error) {
            return reply.code(500).send({ error: 'Internal server error' });
        }
    }

    async addUser(request: FastifyRequest<{ Body: AddUserInput }>, reply: FastifyReply) {
        try {
            const input = request.body;
            const newUser = await this.addUserUseCase.execute(input);
            return reply.code(201).send(newUser);
        } catch (error) {
            console.error('Erreur:', error);
            return reply.code(500).send({ 
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

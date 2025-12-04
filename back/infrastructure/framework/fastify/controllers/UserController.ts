import { FastifyRequest, FastifyReply } from 'fastify';
import { GetUserUseCase } from '../../../../application/usecases/user/GetUserUseCase';
import { AddUserUseCase, AddUserInput } from '../../../../application/usecases/user/AddUserUseCase';

export class UserController {
    public constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly addUserUseCase: AddUserUseCase,
    ) {}

    public async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
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

    public async addUser(
        request: FastifyRequest<{ Body: AddUserInput }>,
        reply: FastifyReply
    ) {
        try {
            const { firstName, lastName, email, identityNumber, passcode, role, state, accounts, loans, orders } = request.body;
            const newUser = await this.addUserUseCase.execute({ firstName, lastName, email, identityNumber, passcode, role, state, accounts, loans, orders });
            return reply.code(201).send(newUser);
        } catch (error) {
            return reply.code(500).send({ error: 'Internal server error' });
        }
    }  
}




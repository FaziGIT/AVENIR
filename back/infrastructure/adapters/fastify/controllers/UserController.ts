import { FastifyRequest, FastifyReply } from 'fastify';
import { GetUserUseCase } from '../../../../application/usecases/user/GetUserUseCase';
import { GetUsersUseCase } from '../../../../application/usecases/user/GetUsersUseCase';
import { AddUserUseCase } from '../../../../application/usecases/user/AddUserUseCase';
import { AddUserRequest } from '../../../../application/requests';
import { GetUserRequest } from '../../../../application/requests';
import { GetUsersRequest } from '../../../../application/requests';
import { UserNotFoundError } from '../../../../domain/errors';
import { UserAlreadyExistsError } from '../../../../domain/errors';
import { ValidationError } from '../../../../application/errors';

export class UserController {
    constructor(
        private readonly getUserUseCase: GetUserUseCase,
        private readonly getUsersUseCase: GetUsersUseCase,
        private readonly addUserUseCase: AddUserUseCase,
    ) {}

    async getUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const getUserRequest: GetUserRequest = {
                id: request.params.id,
            };

            const response = await this.getUserUseCase.execute(getUserRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                return reply.code(404).send({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getUsers(request: FastifyRequest<{ Querystring: { role?: string } }>, reply: FastifyReply) {
        try {
            const getUsersRequest: GetUsersRequest = {
                role: request.query.role,
            };

            const response = await this.getUsersUseCase.execute(getUsersRequest);
            return reply.code(200).send(response);
        } catch (error) {
            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async addUser(request: FastifyRequest<{ Body: AddUserRequest }>, reply: FastifyReply) {
        try {
            const addUserRequest: AddUserRequest = request.body;
            const response = await this.addUserUseCase.execute(addUserRequest);
            return reply.code(201).send(response);
        } catch (error) {
            if (error instanceof UserAlreadyExistsError) {
                return reply.code(409).send({
                    error: 'User already exists',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}


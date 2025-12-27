import { FastifyRequest, FastifyReply } from 'fastify';
import { AddAccountUseCase } from '../../../../application/usecases/account/AddAccountUseCase';
import { DeleteAccountUseCase } from '../../../../application/usecases/account/DeleteAccountUseCase';
import { UpdateAccountNameUseCase } from '../../../../application/usecases/account/UpdateAccountNameUseCase';
import { GetAccountsUseCase } from '../../../../application/usecases/account/GetAccountsUseCase';
import { AddAccountRequest, GetAccountsRequest } from '../../../../application/requests';
import { DeleteAccountRequest } from '../../../../application/requests';
import { UpdateAccountNameRequest } from '../../../../application/requests';
import { AccountNotFoundError } from '../../../../domain/errors';
import { UnauthorizedAccountAccessError } from '../../../../domain/errors';
import { UserNotFoundError } from '../../../../domain/errors';
import { ValidationError } from '../../../../application/errors';

export class AccountController {
    constructor(
        private readonly addAccountUseCase: AddAccountUseCase,
        private readonly deleteAccountUseCase: DeleteAccountUseCase,
        private readonly updateAccountNameUseCase: UpdateAccountNameUseCase,
        private readonly getAccountsUseCase: GetAccountsUseCase,
    ) {}

    async getAccounts(request: FastifyRequest<{ Querystring: { userId: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Use authenticated user's ID for security
            const getAccountsRequest: GetAccountsRequest = {
                userId: request.user.userId,
            };
            const response = await this.getAccountsUseCase.execute(getAccountsRequest);
            return reply.code(200).send(response);
        } catch (error) {
            console.error('Unexpected error:', error);
            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async addAccount(request: FastifyRequest<{ Body: AddAccountRequest }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Use authenticated user's ID for security
            const addAccountRequest: AddAccountRequest = {
                ...request.body,
                userId: request.user.userId,
            };
            const response = await this.addAccountUseCase.execute(addAccountRequest);
            return reply.code(201).send(response);
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

    async deleteAccount(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const deleteAccountRequest: DeleteAccountRequest = {
                id: request.params.id,
                userId: request.user.userId,
            };
            await this.deleteAccountUseCase.execute(deleteAccountRequest);
            return reply.code(204).send();
        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return reply.code(404).send({
                    error: 'Account not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedAccountAccessError) {
                return reply.code(403).send({
                    error: 'Forbidden',
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

    async updateAccountName(request: FastifyRequest<{ Params: { id: string }; Body: { name: string | null } }>, reply: FastifyReply) {
        try {
            if (!request.user) {
                return reply.code(401).send({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const updateAccountNameRequest: UpdateAccountNameRequest = {
                id: request.params.id,
                name: request.body.name,
                userId: request.user.userId,
            };
            await this.updateAccountNameUseCase.execute(updateAccountNameRequest);
            return reply.code(204).send();
        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return reply.code(404).send({
                    error: 'Account not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedAccountAccessError) {
                return reply.code(403).send({
                    error: 'Forbidden',
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


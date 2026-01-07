import { Request, Response } from 'express';
import { AddAccountUseCase } from '../../../../application/usecases/account/AddAccountUseCase';
import { DeleteAccountUseCase } from '../../../../application/usecases/account/DeleteAccountUseCase';
import { UpdateAccountNameUseCase } from '../../../../application/usecases/account/UpdateAccountNameUseCase';
import { GetAccountsUseCase } from '../../../../application/usecases/account/GetAccountsUseCase';
import { GetAccountByIbanUseCase } from '../../../../application/usecases/account/GetAccountByIbanUseCase';
import { AddAccountRequest, GetAccountsRequest, GetAccountByIbanRequest } from '../../../../application/requests';
import { DeleteAccountRequest } from '../../../../application/requests';
import { UpdateAccountNameRequest } from '../../../../application/requests';
import { AccountNotFoundError } from '../../../../domain/errors';
import { UnauthorizedAccountAccessError } from '../../../../domain/errors';
import { UserNotFoundError } from '../../../../domain/errors';
import { ValidationError } from '../../../../application/errors';
import {
    addAccountSchema,
    deleteAccountSchema,
    updateAccountNameSchema,
    getAccountsSchema,
} from '@avenir/shared/schemas/account.schema';
import { ZodError } from 'zod';

export class AccountController {
    constructor(
        private readonly addAccountUseCase: AddAccountUseCase,
        private readonly deleteAccountUseCase: DeleteAccountUseCase,
        private readonly updateAccountNameUseCase: UpdateAccountNameUseCase,
        private readonly getAccountsUseCase: GetAccountsUseCase,
        private readonly getAccountByIbanUseCase: GetAccountByIbanUseCase,
    ) {}

    async getAccounts(req: Request<{}, {}, {}, { userId: string }>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Validation Zod
            const validatedData = getAccountsSchema.parse({
                userId: req.user.userId,
            });

            // Use authenticated user's ID for security
            const getAccountsRequest: GetAccountsRequest = {
                userId: validatedData.userId,
            };
            const response = await this.getAccountsUseCase.execute(getAccountsRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async addAccount(req: Request<{}, {}, AddAccountRequest>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Validation Zod
            const validatedData = addAccountSchema.parse({
                ...req.body,
                userId: req.user.userId,
            });

            // Use authenticated user's ID for security
            const addAccountRequest: AddAccountRequest = {
                name: validatedData.name,
                type: validatedData.type,
                savingType: validatedData.savingType,
                userId: validatedData.userId,
            };
            const response = await this.addAccountUseCase.execute(addAccountRequest);
            return res.status(201).json(response);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async deleteAccount(req: Request<{ id: string }>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Validation Zod
            const validatedData = deleteAccountSchema.parse({
                id: req.params.id,
                userId: req.user.userId,
            });

            const deleteAccountRequest: DeleteAccountRequest = {
                id: validatedData.id,
                userId: validatedData.userId,
            };
            await this.deleteAccountUseCase.execute(deleteAccountRequest);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof AccountNotFoundError) {
                return res.status(404).json({
                    error: 'Account not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedAccountAccessError) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async updateAccountName(req: Request<{ id: string }, {}, { name: string }>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            // Validation Zod
            const validatedData = updateAccountNameSchema.parse({
                id: req.params.id,
                name: req.body.name,
                userId: req.user.userId,
            });

            const updateAccountNameRequest: UpdateAccountNameRequest = {
                id: validatedData.id,
                name: validatedData.name,
                userId: validatedData.userId,
            };
            await this.updateAccountNameUseCase.execute(updateAccountNameRequest);
            return res.status(204).send();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof AccountNotFoundError) {
                return res.status(404).json({
                    error: 'Account not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedAccountAccessError) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getAccountByIban(req: Request<{}, {}, {}, { iban: string }>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const getAccountByIbanRequest: GetAccountByIbanRequest = {
                iban: req.query.iban,
            };
            const response = await this.getAccountByIbanUseCase.execute(getAccountByIbanRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof AccountNotFoundError) {
                return res.status(404).json({
                    error: 'Account not found',
                    message: error.message,
                });
            }

            console.error('Unexpected error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

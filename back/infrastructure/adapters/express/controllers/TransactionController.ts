import { Request, Response } from 'express';
import { GetTransactionsUseCase } from '../../../../application/usecases/transaction/GetTransactionsUseCase';
import { CreateTransactionUseCase } from '../../../../application/usecases/transaction/CreateTransactionUseCase';
import { GetTransactionsRequest, CreateTransactionRequest } from '../../../../application/requests';
import { AccountNotFoundError } from '../../../../domain/errors';
import { UnauthorizedAccountAccessError } from '../../../../domain/errors';
import { ValidationError } from '../../../../application/errors';

export class TransactionController {
    constructor(
        private readonly getTransactionsUseCase: GetTransactionsUseCase,
        private readonly createTransactionUseCase: CreateTransactionUseCase
    ) {}

    async getTransactions(req: Request<{}, {}, {}, { accountId?: string }>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const getTransactionsRequest: GetTransactionsRequest = {
                userId: req.user.userId,
                accountId: req.query.accountId,
            };

            const response = await this.getTransactionsUseCase.execute(getTransactionsRequest);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async createTransaction(req: Request<{}, {}, CreateTransactionRequest>, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const createTransactionRequest: CreateTransactionRequest = {
                ...req.body,
                userId: req.user.userId,
            };

            const response = await this.createTransactionUseCase.execute(createTransactionRequest);
            return res.status(201).json(response);
        } catch (error) {
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

            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}


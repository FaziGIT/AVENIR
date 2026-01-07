import { Router, Request, Response } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { CreateTransactionRequest } from '../../../../application/requests';

export const transactionRoutes = (transactionController: TransactionController) => {
    const router = Router();

    router.get<{}, {}, {}, { accountId?: string }>(
        '/transactions',
        authMiddleware,
        async (req, res) => {
            return transactionController.getTransactions(req, res);
        }
    );

    router.post<{}, {}, CreateTransactionRequest>(
        '/transactions',
        authMiddleware,
        async (req, res) => {
            return transactionController.createTransaction(req, res);
        }
    );

    return router;
};


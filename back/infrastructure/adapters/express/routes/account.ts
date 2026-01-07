import { Router, Request, Response } from 'express';
import { AccountController } from '../controllers/AccountController';
import { AddAccountRequest } from '@avenir/application/requests';
import { authMiddleware } from '../middleware/authMiddleware';

export const accountRoutes = (accountController: AccountController) => {
    const router = Router();

    router.get<{}, {}, {}, { userId: string }>('/accounts', authMiddleware, async (req, res) => {
        return accountController.getAccounts(req, res);
    });

    router.post<{}, {}, AddAccountRequest>('/accounts', authMiddleware, async (req, res) => {
        return accountController.addAccount(req, res);
    });

    router.delete<{ id: string }>('/accounts/:id', authMiddleware, async (req, res) => {
        return accountController.deleteAccount(req, res);
    });

    router.patch<{ id: string }, {}, { name: string }>('/accounts/:id/name', authMiddleware, async (req, res) => {
        return accountController.updateAccountName(req, res);
    });

    router.get<{}, {}, {}, { iban: string }>('/accounts/by-iban', authMiddleware, async (req, res) => {
        return accountController.getAccountByIban(req, res);
    });

    return router;
};

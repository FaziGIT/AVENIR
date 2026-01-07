import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';
import { authMiddleware } from '../middleware/authMiddleware';

export const loanRoutes = (loanController: LoanController) => {
  const router = Router();

  router.post('/', authMiddleware, (req, res) => {
    return loanController.createLoan(req, res);
  });

  router.get('/client/:clientId', authMiddleware, (req, res) => {
    return loanController.getClientLoans(req, res);
  });

  router.post('/process-payments', authMiddleware, (req, res) => {
    return loanController.processManualPayment(req, res);
  });

  return router;
};

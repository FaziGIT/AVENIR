import { Request, Response } from 'express';
import { CreateLoanUseCase } from '../../../../application/usecases/loan/CreateLoanUseCase';
import { GetClientLoansUseCase } from '../../../../application/usecases/loan/GetClientLoansUseCase';
import { ProcessMonthlyPaymentsUseCase } from '../../../../application/usecases/loan/ProcessMonthlyPaymentsUseCase';
import { CreateLoanRequest } from '../../../../application/requests/CreateLoanRequest';
import { createLoanSchema } from '@avenir/shared/schemas/loan.schema';
import { z } from 'zod';
import { LoanResponse } from '../../../../application/responses/LoanResponse';
import { UserRole } from '@avenir/shared/enums';
import { UserRepository } from '../../../../domain/repositories/UserRepository';
import { UserNotFoundError, ClientHasNoAccountError } from '../../../../domain/errors';

export class LoanController {
  constructor(
    private readonly createLoanUseCase: CreateLoanUseCase,
    private readonly getClientLoansUseCase: GetClientLoansUseCase,
    private readonly processMonthlyPaymentsUseCase: ProcessMonthlyPaymentsUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  async createLoan(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const validatedData = createLoanSchema.parse(req.body);
      const createLoanRequest = new CreateLoanRequest(
        validatedData.name,
        req.user.userId,
        validatedData.clientId,
        validatedData.amount,
        validatedData.duration,
        validatedData.interestRate,
        validatedData.insuranceRate,
      );

      const loan = await this.createLoanUseCase.execute(createLoanRequest);
      const loanResponse = LoanResponse.fromLoan(loan);

      return res.status(201).json(loanResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }

      if (error instanceof UserNotFoundError) {
        return res.status(404).json({
          error: error.message,
        });
      }

      if (error instanceof ClientHasNoAccountError) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getClientLoans(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const loans = await this.getClientLoansUseCase.execute(req.params.clientId);
      const loansResponse = loans.map(loan => LoanResponse.fromLoan(loan));

      return res.status(200).json(loansResponse);
    } catch (error) {

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async processManualPayment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const user = await this.userRepository.getById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          error: new UserNotFoundError(req.user.userId).message,
        });
      }

      if (user.role !== UserRole.ADVISOR) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only advisors can manually process payments',
        });
      }

      const advisorName = `${user.firstName} ${user.lastName}`;

      await this.processMonthlyPaymentsUseCase.execute(true, advisorName);

      return res.status(200).json({
        message: 'Manual payment processing completed successfully',
      });
    } catch (error) {

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

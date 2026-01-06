import { FastifyRequest, FastifyReply } from 'fastify';
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

  async createLoan(
    request: FastifyRequest<{
      Body: {
        name: string;
        clientId: string;
        amount: number;
        duration: number;
        interestRate: number;
        insuranceRate: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const validatedData = createLoanSchema.parse(request.body);
      const createLoanRequest = new CreateLoanRequest(
        validatedData.name,
        request.user.userId,
        validatedData.clientId,
        validatedData.amount,
        validatedData.duration,
        validatedData.interestRate,
        validatedData.insuranceRate,
      );

      const loan = await this.createLoanUseCase.execute(createLoanRequest);
      const loanResponse = LoanResponse.fromLoan(loan);

      return reply.code(201).send(loanResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }

      if (error instanceof UserNotFoundError) {
        return reply.code(404).send({
          error: error.message,
        });
      }

      if (error instanceof ClientHasNoAccountError) {
        return reply.code(400).send({
          error: error.message,
        });
      }

      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getClientLoans(
    request: FastifyRequest<{ Params: { clientId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const loans = await this.getClientLoansUseCase.execute(request.params.clientId);
      const loansResponse = loans.map(loan => LoanResponse.fromLoan(loan));

      return reply.code(200).send(loansResponse);
    } catch (error) {
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async processManualPayment(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      if (!request.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const user = await this.userRepository.getById(request.user.userId);

      if (!user) {
        return reply.code(404).send({
          error: new UserNotFoundError(request.user.userId).message,
        });
      }

      if (user.role !== UserRole.ADVISOR) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Only advisors can manually process payments',
        });
      }

      const advisorName = `${user.firstName} ${user.lastName}`;

      await this.processMonthlyPaymentsUseCase.execute(true, advisorName);

      return reply.code(200).send({
        message: 'Manual payment processing completed successfully',
      });
    } catch (error) {
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

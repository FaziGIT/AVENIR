import { randomUUID } from 'crypto';
import { Loan } from '@avenir/domain/entities/Loan';
import { LoanRepository } from '@avenir/domain/repositories/LoanRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { CreateLoanRequest } from '../../requests/CreateLoanRequest';
import { LoanResponse } from '../../responses/LoanResponse';
import { UserNotFoundError, LoanNotFoundError } from '@avenir/domain/errors';
import { UserRole, LoanStatus } from '@avenir/shared/enums';
import { NotificationType } from '@avenir/shared/enums/NotificationType';
import { SSEService } from '@avenir/infrastructure/adapters/services/SSEService';
import { LoanCalculationService } from '@avenir/domain/services/LoanCalculationService';
import { DeliverLoanUseCase } from "./DeliverLoanUseCase";
import { CreateNotificationUseCase } from '../notification/CreateNotificationUseCase';

export class CreateLoanUseCase {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly userRepository: UserRepository,
    private readonly sseService: SSEService,
    private readonly deliverLoanUseCase: DeliverLoanUseCase,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute(request: CreateLoanRequest): Promise<LoanResponse> {
    const advisor = await this.userRepository.getById(request.advisorId);
    if (!advisor || advisor.role !== UserRole.ADVISOR) {
      throw new UserNotFoundError(request.advisorId);
    }

    const client = await this.userRepository.getById(request.clientId);
    if (!client || client.role !== UserRole.CLIENT) {
      throw new UserNotFoundError(request.clientId);
    }

    const calculation = LoanCalculationService.calculateLoan(
      request.amount,
      request.duration,
      request.interestRate,
      request.insuranceRate,
    );

    const now = new Date();
    const paidAmount = 0;

    // La première échéance : 1er du mois suivant à 10h00
    const nextPayment = new Date(now);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    nextPayment.setDate(1);
    nextPayment.setHours(10, 0, 0, 0);

    const loan = new Loan(
      randomUUID(),
      request.name,
      request.advisorId,
      request.clientId,
      calculation.amount,
      calculation.duration,
      calculation.annualInterestRate,
      calculation.insuranceRate,
      calculation.monthlyPayment,
      calculation.totalCost,
      calculation.totalInterest,
      calculation.insuranceCost,
      paidAmount,
      LoanStatus.ACTIVE,
      now,
      now,
      nextPayment
    );

    const createdLoan = await this.loanRepository.createLoan(loan);

    const advisorName = `${advisor.firstName} ${advisor.lastName}`;
    await this.createNotificationUseCase.execute(
      client.id,
      'Nouveau crédit accordé',
      `Votre conseiller ${advisorName} vous a accordé un nouveau crédit "${request.name}" de ${calculation.amount.toFixed(2)}€.`,
      NotificationType.LOAN,
      advisorName
    );

    // Créditer le compte du client immédiatement
    await this.deliverLoanUseCase.execute(createdLoan.id);

    // Récupérer le crédit mis à jour
    const updatedLoan = await this.loanRepository.getLoanById(createdLoan.id);
    if (!updatedLoan) {
      throw new LoanNotFoundError(createdLoan.id);
    }

    // Envoyer l'événement au client et à l'advisor
    const loanResponse = LoanResponse.fromLoan(updatedLoan);
    this.sseService.notifyLoanCreated(client.id, loanResponse, request.advisorId);

    return loanResponse;
  }
}

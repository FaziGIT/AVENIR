import { LoanRepository } from '../../../domain/repositories/LoanRepository';
import { AccountRepository } from '../../../domain/repositories/AccountRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { CreateNotificationUseCase } from '../notification/CreateNotificationUseCase';
import { NotificationType } from '@avenir/shared/enums/NotificationType';
import { Loan } from '../../../domain/entities/Loan';
import { Account } from '../../../domain/entities/Account';
import { SSEService } from '../../../infrastructure/adapters/services/SSEService';
import { LoanResponse } from '../../responses/LoanResponse';
import { LoanStatus } from "@avenir/shared/enums/LoanStatus";
import { AccountType } from "@avenir/shared/enums/AccountType";
import { UserState } from "../../../domain/enumerations/UserState";

export class ProcessMonthlyPaymentsUseCase {
    constructor(
        private loanRepository: LoanRepository,
        private accountRepository: AccountRepository,
        private userRepository: UserRepository,
        private createNotificationUseCase: CreateNotificationUseCase,
        private sseService: SSEService
    ) {}

    async getLoansToProcess(): Promise<Loan[]> {
        const now = new Date();
        const activeLoans = await this.loanRepository.getLoansByStatus(LoanStatus.ACTIVE);
        const defaultedLoans = await this.loanRepository.getLoansByStatus(LoanStatus.DEFAULTED);

        const allLoansToProcess = [...activeLoans, ...defaultedLoans];

        return allLoansToProcess.filter(loan =>
            loan.nextPaymentDate && loan.nextPaymentDate <= now
        );
    }

    async execute(isManual: boolean = false, advisorName?: string): Promise<void> {
        let loansToProcess: Loan[];

        if (isManual) {
            loansToProcess = await this.loanRepository.getLoansByStatus(LoanStatus.DEFAULTED);
        } else {
            loansToProcess = await this.getLoansToProcess();
        }

        for (const loan of loansToProcess) {
            try {
                await this.processLoanPayment(loan, isManual, advisorName);
            } catch (error) {
                // Continue avec les autres crédits même si un échoue
            }
        }
    }

    private async processLoanPayment(loan: Loan, isManual: boolean = false, advisorName?: string): Promise<void> {
        const user = await this.userRepository.getById(loan.clientId);
        if (!user || user.state === UserState.BANNED) {
            // Ne pas traiter le prélèvement pour un utilisateur banni
            return;
        }

        // Si c'est un traitement manuel, envoyer une notification d'information au client
        if (isManual && advisorName) {
            await this.createNotificationUseCase.execute(
                loan.clientId,
                'Traitement manuel lancé',
                `Votre conseiller ${advisorName} a lancé un traitement manuel pour votre crédit "${loan.name}".`,
                NotificationType.LOAN,
                advisorName
            );
        }

        const accounts = await this.accountRepository.getByUserId(loan.clientId);
        if (accounts.length === 0) {
            return;
        }

        const account = accounts.find(acc => acc.type === AccountType.CURRENT) || accounts[0];

        // Vérifier que le solde est suffisant
        if (account.balance < loan.monthlyPayment) {
            const defaultedLoan = new Loan(
                loan.id,
                loan.name,
                loan.advisorId,
                loan.clientId,
                loan.amount,
                loan.duration,
                loan.annualInterestRate,
                loan.insuranceRate,
                loan.monthlyPayment,
                loan.totalCost,
                loan.totalInterest,
                loan.insuranceCost,
                loan.paidAmount,
                LoanStatus.DEFAULTED,
                loan.createdAt,
                new Date(),
                loan.nextPaymentDate
            );

            await this.loanRepository.updateLoan(defaultedLoan);
            await this.createNotificationUseCase.execute(
                loan.clientId,
                'Échéance impayée',
                `Le prélèvement de ${loan.monthlyPayment.toFixed(2)}€ pour votre crédit "${loan.name}" n'a pas pu être effectué en raison d'un solde insuffisant. Si vous ne contactez pas votre conseiller depuis la page Contact pour régulariser votre situation, un nouvel essai de prélèvement sera automatiquement effectué à la prochaine date d'échéance prévue.`,
                NotificationType.LOAN,
                'Système'
            );

            // Envoyer l'événement SSE au client ET à l'advisor
            const loanResponse = LoanResponse.fromLoan(defaultedLoan);
            this.sseService.notifyLoanCreated(loan.clientId, loanResponse, loan.advisorId);

            return;
        }

        // Prélever la mensualité
        const updatedAccount = new Account(
            account.id,
            account.userId,
            account.iban,
            account.name,
            account.type,
            account.balance - loan.monthlyPayment,
            account.currency,
            account.cardNumber,
            account.cardHolderName,
            account.cardExpiryDate,
            account.cardCvv,
            account.savingType,
            account.transactions,
            account.createdAt
        );
        await this.accountRepository.update(updatedAccount);

        const newPaidAmount = loan.paidAmount + loan.monthlyPayment;
        const isCompleted = newPaidAmount >= loan.totalCost;

        // Configuration de la prochaine échéance au 1er du mois à 10h00
        let nextPayment: Date | undefined;
        if (!isCompleted) {
            nextPayment = new Date();
            nextPayment.setMonth(nextPayment.getMonth() + 1);
            nextPayment.setDate(1);
            nextPayment.setHours(10, 0, 0, 0);
        }

        const newStatus = isCompleted ? LoanStatus.COMPLETED : LoanStatus.ACTIVE;

        // Mettre à jour le crédit
        const updatedLoan = new Loan(
            loan.id,
            loan.name,
            loan.advisorId,
            loan.clientId,
            loan.amount,
            loan.duration,
            loan.annualInterestRate,
            loan.insuranceRate,
            loan.monthlyPayment,
            loan.totalCost,
            loan.totalInterest,
            loan.insuranceCost,
            newPaidAmount,
            newStatus,
            loan.createdAt,
            new Date(),
            nextPayment
        );

        await this.loanRepository.updateLoan(updatedLoan);

        const loanResponse = LoanResponse.fromLoan(updatedLoan);
        this.sseService.notifyLoanCreated(loan.clientId, loanResponse, loan.advisorId);

        if (isCompleted) {
            await this.createNotificationUseCase.execute(
                loan.clientId,
                'Crédit remboursé',
                `Félicitations ! Votre crédit "${loan.name}" est entièrement remboursé.`,
                NotificationType.LOAN,
                'Système'
            );
        } else {
            const remaining = loan.totalCost - newPaidAmount;
            const wasDefaulted = loan.status === LoanStatus.DEFAULTED;

            await this.createNotificationUseCase.execute(
                loan.clientId,
                wasDefaulted ? 'Paiement rattrapé' : 'Mensualité prélevée',
                wasDefaulted
                    ? `Le paiement de ${loan.monthlyPayment.toFixed(2)}€ pour votre crédit "${loan.name}" a été effectué avec succès. Votre crédit est de nouveau actif. Reste à payer : ${remaining.toFixed(2)}€`
                    : `La mensualité de ${loan.monthlyPayment.toFixed(2)}€ pour votre crédit "${loan.name}" a été prélevée. Reste à payer : ${remaining.toFixed(2)}€`,
                NotificationType.LOAN,
                'Système'
            );
        }
    }
}

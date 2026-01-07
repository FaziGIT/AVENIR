import { UserRepository } from "../../../domain/repositories/UserRepository";
import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { PortfolioRepository } from "../../../domain/repositories/PortfolioRepository";
import { LoanRepository } from "../../../domain/repositories/LoanRepository";
import { UserNotFoundError } from "../../../domain/errors";
import { ValidationError } from "../../errors";
import { LoanStatus } from "@avenir/shared/enums";
import { Loan } from "../../../domain/entities/Loan";
import { SSEService } from "../../../infrastructure/adapters/services/SSEService";

interface DeleteUserWithIBANTransferRequest {
    userId: string;
    transferIBAN: string;
}

interface DeleteResult {
    totalTransferred: number;
    portfoliosLiquidated: number;
    accountsClosed: number;
    remainingDebt: number;
    loansStatus: 'all_repaid' | 'partial_repaid' | 'defaulted';
}

export class DeleteUserWithIBANTransferUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accountRepository: AccountRepository,
        private readonly portfolioRepository: PortfolioRepository,
        private readonly loanRepository: LoanRepository,
        private readonly sseService: SSEService
    ) {}

    async execute(request: DeleteUserWithIBANTransferRequest): Promise<DeleteResult> {
        const user = await this.userRepository.getById(request.userId);
        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        if (!request.transferIBAN || request.transferIBAN.trim().length === 0) {
            throw new ValidationError("Transfer IBAN is required for account deletion");
        }

        const accounts = await this.accountRepository.getByUserId(request.userId);
        const portfolios = await this.portfolioRepository.getByUserId(request.userId);
        const totalAccountBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        let totalPortfolioValue = 0;
        for (const portfolio of portfolios) {
            totalPortfolioValue += portfolio.getCurrentValue();
            await this.portfolioRepository.remove(portfolio.id);
        }

        const totalFunds = totalAccountBalance + totalPortfolioValue;

        const loans = await this.loanRepository.getLoansByClientId(request.userId);
        const activeLoans = loans.filter(
            loan => loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.DEFAULTED
        );

        const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.remainingPayment, 0);

        let loansStatus: 'all_repaid' | 'partial_repaid' | 'defaulted' = 'all_repaid';
        let remainingDebt = 0;

        if (totalDebt > 0) {
            if (totalFunds >= totalDebt) {
                const sortedLoans = [...activeLoans].sort((a, b) => a.remainingPayment - b.remainingPayment);

                for (const loan of sortedLoans) {
                    const completedLoan = new Loan(
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
                        loan.totalCost, // paidAmount = totalCost (entièrement remboursé)
                        LoanStatus.COMPLETED,
                        loan.createdAt,
                        new Date(),
                        undefined
                    );

                    await this.loanRepository.updateLoan(completedLoan);
                }
            } else if (totalFunds > 0) {
                loansStatus = 'partial_repaid';
                remainingDebt = totalDebt - totalFunds;

                const sortedLoans = [...activeLoans].sort((a, b) => a.remainingPayment - b.remainingPayment);
                let availableFunds = totalFunds;

                for (const loan of sortedLoans) {
                    if (availableFunds >= loan.remainingPayment) {
                        // Rembourser complètement ce crédit
                        const completedLoan = new Loan(
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
                            loan.totalCost,
                            LoanStatus.COMPLETED,
                            loan.createdAt,
                            new Date(),
                            undefined
                        );

                        await this.loanRepository.updateLoan(completedLoan);
                        availableFunds -= loan.remainingPayment;
                    } else {
                        // Mettre en défaut les crédits non remboursés
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
                            undefined
                        );

                        await this.loanRepository.updateLoan(defaultedLoan);
                    }
                }
            } else {
                // Pas de fonds, tout passe en défaut
                loansStatus = 'defaulted';
                remainingDebt = totalDebt;

                for (const loan of activeLoans) {
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
                        undefined
                    );

                    await this.loanRepository.updateLoan(defaultedLoan);
                }
            }
        }

        const totalTransferred = Math.max(0, totalFunds - totalDebt);

        // Simuler le transfert vers l'IBAN
        console.log(`[DELETE USER] User ${user.email} - Portfolios liquidated: ${portfolios.length}, Accounts closed: ${accounts.length}`);

        this.sseService.notifyUserDeleted(user.id);
        await this.userRepository.remove(request.userId);

        return {
            totalTransferred,
            portfoliosLiquidated: portfolios.length,
            accountsClosed: accounts.length,
            remainingDebt,
            loansStatus,
        };
    }
}

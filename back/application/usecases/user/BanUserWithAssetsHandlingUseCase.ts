import { UserRepository } from "../../../domain/repositories/UserRepository";
import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { PortfolioRepository } from "../../../domain/repositories/PortfolioRepository";
import { LoanRepository } from "../../../domain/repositories/LoanRepository";
import { UserNotFoundError } from "../../../domain/errors";
import { UserState } from "../../../domain/enumerations/UserState";
import { User } from "../../../domain/entities/User";
import { Account } from "../../../domain/entities/Account";
import { Loan } from "../../../domain/entities/Loan";
import { LoanStatus } from "@avenir/shared/enums";
import { SSEService } from "../../../infrastructure/adapters/services/SSEService";

interface BanUserWithAssetsRequest {
    userId: string;
}

interface BanResult {
    totalAssetsValue: number;
    portfoliosLiquidated: number;
    loansRepaid: number;
    remainingDebt: number;
    accountsFrozen: number;
}

export class BanUserWithAssetsHandlingUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly accountRepository: AccountRepository,
        private readonly portfolioRepository: PortfolioRepository,
        private readonly loanRepository: LoanRepository,
        private readonly sseService: SSEService
    ) {}

    async execute(request: BanUserWithAssetsRequest): Promise<BanResult> {
        const user = await this.userRepository.getById(request.userId);
        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        const accounts = await this.accountRepository.getByUserId(request.userId);
        const portfolios = await this.portfolioRepository.getByUserId(request.userId);
        const totalAssets = accounts.reduce((sum, account) => sum + account.balance, 0);

        const loans = await this.loanRepository.getLoansByClientId(request.userId);
        const activeLoans = loans.filter(
            loan => loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.DEFAULTED
        );

        const totalDebt = activeLoans.reduce((sum, loan) => sum + loan.remainingPayment, 0);

        // Rembourser les crédits du plus petit au plus grand
        const sortedLoans = [...activeLoans].sort((a, b) => a.remainingPayment - b.remainingPayment);
        let availableFunds = totalAssets;
        let loansRepaid = 0;

        for (const loan of sortedLoans) {
            if (availableFunds >= loan.remainingPayment) {
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
                loansRepaid++;
            }
            // Sinon on ne fait rien, le crédit reste en DEFAULTED
        }

        // Liquider tous les portfolios
        for (const portfolio of portfolios) {
            await this.portfolioRepository.remove(portfolio.id);
        }

        for (const account of accounts) {
            const frozenAccount = new Account(
                account.id,
                account.userId,
                account.iban,
                account.name,
                account.type,
                0, // Balance à 0
                account.currency,
                account.cardNumber,
                account.cardHolderName,
                account.cardExpiryDate,
                account.cardCvv,
                account.savingType,
                account.transactions,
                account.createdAt
            );

            await this.accountRepository.update(frozenAccount);
        }

        const bannedUser = new User(
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.identityNumber,
            user.passcode,
            user.role,
            UserState.BANNED,
            user.accounts,
            user.loans,
            user.orders,
            user.createdAt,
            user.verificationToken,
            user.verifiedAt,
            user.advisorId
        );

        await this.userRepository.update(bannedUser);

        this.sseService.notifyUserBanned(user.id);
        const remainingDebt = totalDebt - (totalAssets - availableFunds);

        return {
            totalAssetsValue: totalAssets,
            portfoliosLiquidated: portfolios.length,
            loansRepaid,
            remainingDebt: Math.max(0, remainingDebt),
            accountsFrozen: accounts.length,
        };
    }
}

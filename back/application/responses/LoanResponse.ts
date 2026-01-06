import {Loan} from "../../domain/entities/Loan";

export class LoanResponse {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly advisorId: string,
    public readonly clientId: string,
    public readonly amount: number,
    public readonly duration: number,
    public readonly annualInterestRate: number,
    public readonly insuranceRate: number,
    public readonly monthlyPayment: number,
    public readonly totalCost: number,
    public readonly totalInterest: number,
    public readonly insuranceCost: number,
    public readonly paidAmount: number,
    public readonly remainingPayment: number,
    public readonly progressPercentage: number,
    public readonly monthsPaid: number,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly nextPaymentDate?: Date,
    public readonly endDate?: Date,
  ) {}

  static fromLoan(loan: Loan): LoanResponse {
    let endDate: Date | undefined;
    if (loan.createdAt) {
      endDate = new Date(loan.createdAt);
      endDate.setMonth(endDate.getMonth() + loan.duration + 1); // +1 mois pour la première échéance
    }

    return new LoanResponse(
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
      loan.remainingPayment,
      loan.progressPercentage,
      loan.monthsPaid,
      loan.status,
      loan.createdAt,
      loan.updatedAt,
      loan.nextPaymentDate,
      endDate,
    );
  }
}

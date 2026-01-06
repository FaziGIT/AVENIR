import { ClientLoan } from '@/types/client';
import { LoanStatus } from '@avenir/shared/enums';
import { LoanApiResponse } from '@/lib/api/loan.api';

export const mapLoanApiResponseToClientLoan = (
  loan: LoanApiResponse,
  clientId: string
): ClientLoan => {
  const endDate = loan.endDate ? new Date(loan.endDate) : (() => {
    const date = new Date(loan.createdAt);
    date.setMonth(date.getMonth() + loan.duration + 1); // +1 pour la première échéance, 1 mois après la création du crédit
    return date;
  })();

  return {
    id: loan.id,
    clientId: clientId,
    name: loan.name,
    amount: loan.amount,
    duration: loan.duration,
    interestRate: loan.annualInterestRate,
    insuranceRate: loan.insuranceRate,
    monthlyPayment: loan.monthlyPayment,
    totalCost: loan.totalCost,
    totalInterest: loan.totalInterest,
    insuranceCost: loan.insuranceCost,
    remainingPayment: loan.remainingPayment,
    progressPercentage: loan.progressPercentage,
    monthsPaid: loan.monthsPaid,
    status: loan.status as LoanStatus,
    endDate: endDate,
    nextPaymentDate: loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : undefined,
    createdAt: new Date(loan.createdAt),
  };
};

export const mapLoansApiResponseToClientLoans = (
  loans: LoanApiResponse[],
  clientId: string
): ClientLoan[] => {
  return loans.map(loan => mapLoanApiResponseToClientLoan(loan, clientId));
};

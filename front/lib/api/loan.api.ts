const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoanApiResponse {
  id: string;
  name: string;
  advisorId: string;
  clientId: string;
  amount: number;
  duration: number;
  annualInterestRate: number;
  insuranceRate: number;
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  insuranceCost: number;
  remainingPayment: number;
  paidAmount: number;
  progressPercentage: number;
  monthsPaid: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  nextPaymentDate?: Date;
  endDate?: Date;
}

export type LoanData = LoanApiResponse;

export interface CreateLoanRequest {
  name: string;
  clientId: string;
  amount: number;
  duration: number;
  interestRate: number;
  insuranceRate: number;
}

export const createLoan = async (data: CreateLoanRequest): Promise<LoanData> => {
  const response = await fetch(`${API_URL}/api/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to create loan');
  }

  const loanData = await response.json();

  return {
    ...loanData,
    createdAt: new Date(loanData.createdAt),
    updatedAt: new Date(loanData.updatedAt),
  };
};

export const getClientLoans = async (clientId: string): Promise<LoanApiResponse[]> => {
  const response = await fetch(`${API_URL}/api/loans/client/${clientId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch client loans');
  }

  const loansData: LoanApiResponse[] = await response.json();

  return loansData.map((loan) => ({
    ...loan,
    createdAt: new Date(loan.createdAt),
    updatedAt: new Date(loan.updatedAt),
    nextPaymentDate: loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : undefined,
  }));
};

export const processManualPayment = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/api/loans/process-payments`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to process manual payment');
  }
};

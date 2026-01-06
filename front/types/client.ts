import { User, Chat } from './chat';
import { LoanStatus } from './enums';

export interface ClientLoan {
  id: string;
  clientId: string;
  name: string;
  amount: number;
  duration: number;
  interestRate: number;
  insuranceRate: number;
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
  insuranceCost: number;
  remainingPayment: number;
  progressPercentage?: number;
  monthsPaid?: number;
  endDate: Date;
  nextPaymentDate?: Date;
  status: LoanStatus;
  createdAt: Date;
}

export interface ClientNotification {
  id: string;
  clientId: string;
  advisorId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ClientWithDetails extends User {
  activeChats: Chat[];
  loans: ClientLoan[];
  notifications: ClientNotification[];
  clientSince: Date;
}

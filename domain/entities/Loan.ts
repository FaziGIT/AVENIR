import { LoanState } from "../enum/Loan/State";
import { User } from "./User";

export class Loan {
    public constructor(
        public readonly id: string,
        public readonly advisor: User,
        public readonly client: User,
        public readonly amount: number,
        public readonly annualInterestRate: number,
        public readonly insuranceRate: number,
        public readonly monthlyPayment: number,
        public readonly state: LoanState,
        public readonly createdAt: Date,
    ) {}
}
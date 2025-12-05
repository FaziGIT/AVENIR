import { LoanState } from "../enum/Loan/State";
import { User } from "./User";

export class Loan {
    constructor(
        readonly id: string,
        readonly advisor: User,
        readonly client: User,
        readonly amount: number,
        readonly annualInterestRate: number,
        readonly insuranceRate: number,
        readonly monthlyPayment: number,
        readonly state: LoanState,
        readonly createdAt: Date,
    ) {}
}
import { Account } from "./Account";
import { TransactionType } from "../enumerations/TransactionType";

export class Transaction {
    constructor(
        readonly id: string,
        readonly fromAccount: Account,
        readonly toAccount: Account,
        readonly amount: number,
        readonly description: string | null,
        readonly type: TransactionType,
        readonly createdAt: Date,
    ) {}
}
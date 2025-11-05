import { Account } from "./Account";
import { TransactionType } from "../enum/Transaction/Type";

export class Transaction {
    public constructor(
        public readonly id: string,
        public readonly fromAccount: Account,
        public readonly toAccount: Account,
        public readonly amount: number,
        public readonly description: string | null,
        public readonly type: TransactionType,
        public readonly createdAt: Date,
    ) {}
}
import { User } from "./User";
import { AccountType } from "../enum/Account/Type";
import { Transaction } from "./Transaction";
import { SavingRate } from "./SavingRate";

export class Account {
    constructor(
        readonly id: string,
        readonly user: User,
        readonly iban: string,
        readonly name: string | null,
        readonly type: AccountType,
        readonly balance: number,
        readonly savingRate: SavingRate | null,
        readonly transactions: Transaction[] = [],
        readonly createdAt: Date,
    ) {}
}
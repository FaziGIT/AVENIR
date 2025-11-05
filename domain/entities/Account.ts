import { User } from "./User";
import { AccountType } from "../enum/Account/Type";
import { SavingRate } from "./SavingRate";

export class Account {
    public constructor(
        public readonly id: string,
        public readonly user: User,
        public readonly iban: string,
        public readonly name: string | null,
        public readonly type: AccountType,
        public readonly balance: number,
        public readonly savingRates: Array<SavingRate> = [],
        public readonly createdAt: Date,
    ) {}
}
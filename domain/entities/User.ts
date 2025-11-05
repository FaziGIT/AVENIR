import { UserRole } from "../enum/User/Role";
import { UserState } from "../enum/User/State";
import { Account } from "./Account";

export class User {
    public constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly identityNumber: string,
        public readonly passcode: string,
        public readonly role: UserRole,
        public readonly state: UserState,
        public readonly accounts: Array<Account> = [],

        public readonly createdAt: Date,
    ) {}
}

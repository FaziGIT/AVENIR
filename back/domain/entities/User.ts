import { UserRole } from "../enumerations/UserRole";
import { UserState } from "../enumerations/UserState";
import { Account } from "./Account";
import { Loan } from "./Loan";
import { Order } from "./Order";

export class User {
    constructor(
        readonly id: string,
        readonly firstName: string,
        readonly lastName: string,
        readonly email: string,
        readonly identityNumber: string,
        readonly passcode: string,
        readonly role: UserRole,
        readonly state: UserState,
        readonly accounts: Account[] = [],
        readonly loans: Loan[] = [],
        readonly orders: Order[] = [],
        readonly createdAt: Date,
    ) {}
}

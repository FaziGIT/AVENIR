import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../ports/repositories/UserRepository";
import { randomUUID } from "crypto";
import { UserRole } from "../../../domain/enum/User/Role";
import { UserState } from "../../../domain/enum/User/State";
import { Account } from "../../../domain/entities/Account";
import { Loan } from "../../../domain/entities/Loan";
import { Order } from "../../../domain/entities/Order";

export interface AddUserInput {
    firstName: string;
    lastName: string;
    email: string;
    identityNumber: string;
    passcode: string;
    role: UserRole;
    state: UserState;
    accounts: Account[];
    loans: Loan[];
    orders: Order[];
}

export class AddUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: AddUserInput): Promise<User> {
        const user = new User(
            randomUUID(),
            input.firstName,
            input.lastName,
            input.email,
            input.identityNumber,
            input.passcode,
            input.role,
            input.state,
            input.accounts,
            input.loans,
            input.orders,
            new Date()
        );

        return this.userRepository.add(user);
    }
}

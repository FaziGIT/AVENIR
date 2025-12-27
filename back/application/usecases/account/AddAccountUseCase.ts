import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { AccountFactory } from "../../../domain/services/AccountFactory";
import { randomUUID } from "crypto";
import { AddAccountRequest } from "../../requests/AddAccountRequest";
import { AddAccountResponse, AddAccountResponseMapper } from "../../responses/AddAccountResponse";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError";

export class AddAccountUseCase {
    private readonly accountFactory: AccountFactory;

    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly userRepository: UserRepository
    ) {
        this.accountFactory = new AccountFactory(accountRepository);
    }

    async execute(request: AddAccountRequest): Promise<AddAccountResponse> {
        // Verify user exists
        const user = await this.userRepository.getById(request.userId);
        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        const holderName = `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`;
        const account = await this.accountFactory.createAccount(
            randomUUID(),
            user.id,
            request.name || `Compte ${request.type}`,
            request.type,
            holderName
        );

        const savedAccount = await this.accountRepository.add(account);
        return AddAccountResponseMapper.toResponse(savedAccount);
    }
}

import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { DeleteAccountRequest } from "../../requests/DeleteAccountRequest";
import { AccountNotFoundError } from "../../../domain/errors/AccountNotFoundError";
import { UnauthorizedAccountAccessError } from "../../../domain/errors/UnauthorizedAccountAccessError";
import { AccountType } from "../../../domain/enumerations/AccountType";
import { ValidationError } from "../../errors/ValidationError";

export class DeleteAccountUseCase {
    constructor(private readonly accountRepository: AccountRepository) {}

    async execute(request: DeleteAccountRequest): Promise<void> {
        const account = await this.accountRepository.getById(request.id);
        if (!account) {
            throw new AccountNotFoundError(request.id);
        }

        // Verify user owns the account
        if (account.userId !== request.userId) {
            throw new UnauthorizedAccountAccessError();
        }

        if (account.type === AccountType.CURRENT) {
            const userAccounts = await this.accountRepository.getByUserId(account.userId);
            const currentAccounts = userAccounts.filter(acc => acc.type === AccountType.CURRENT);
            
            if (currentAccounts.length === 1) {
                throw new ValidationError('Cannot delete the last current account. At least one current account must remain.');
            }
        }

        await this.accountRepository.remove(request.id);
    }
}


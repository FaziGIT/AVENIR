import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { UpdateAccountNameRequest } from "../../requests/UpdateAccountNameRequest";
import { AccountNotFoundError } from "../../../domain/errors/AccountNotFoundError";
import { UnauthorizedAccountAccessError } from "../../../domain/errors/UnauthorizedAccountAccessError";
import { Account } from "../../../domain/entities/Account";
import { AccountType } from "../../../domain/enumerations/AccountType";
import { ValidationError } from "../../errors/ValidationError";

export class UpdateAccountNameUseCase {
    constructor(private readonly accountRepository: AccountRepository) {}

    async execute(request: UpdateAccountNameRequest): Promise<void> {
        const account = await this.accountRepository.getById(request.id);
        if (!account) {
            throw new AccountNotFoundError(request.id);
        }

        // Verify user owns the account
        if (account.userId !== request.userId) {
            throw new UnauthorizedAccountAccessError();
        }

        if (account.type === AccountType.SAVINGS) {
            throw new ValidationError('Savings account names cannot be changed. The name is determined by the saving rate.');
        }

        const updatedAccount = new Account(
            account.id,
            account.userId,
            account.iban,
            request.name,
            account.type,
            account.balance,
            account.currency,
            account.cardNumber,
            account.cardHolderName,
            account.cardExpiryDate,
            account.cardCvv,
            account.savingRate,
            account.transactions,
            account.createdAt
        );

        await this.accountRepository.update(updatedAccount);
    }
}


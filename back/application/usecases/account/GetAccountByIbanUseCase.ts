import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { GetAccountByIbanRequest } from "../../requests/GetAccountByIbanRequest";
import { GetAccountsResponse, GetAccountsResponseMapper } from "../../responses/GetAccountsResponse";
import { AccountNotFoundError } from "../../../domain/errors/AccountNotFoundError";

export class GetAccountByIbanUseCase {
    constructor(private readonly accountRepository: AccountRepository) {}

    async execute(request: GetAccountByIbanRequest): Promise<GetAccountsResponse> {
        const account = await this.accountRepository.getByIban(request.iban);
        if (!account) {
            throw new AccountNotFoundError(request.iban);
        }
        return GetAccountsResponseMapper.toResponse(account);
    }
}

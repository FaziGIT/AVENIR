import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import { GetAccountsRequest } from "../../requests/GetAccountsRequest";
import { GetAccountsResponse, GetAccountsResponseMapper } from "../../responses/GetAccountsResponse";

export class GetAccountsUseCase {
    constructor(private readonly accountRepository: AccountRepository) {}

    async execute(request: GetAccountsRequest): Promise<GetAccountsResponse[]> {
        const accounts = await this.accountRepository.getByUserId(request.userId);
        return GetAccountsResponseMapper.toResponseList(accounts);
    }
}


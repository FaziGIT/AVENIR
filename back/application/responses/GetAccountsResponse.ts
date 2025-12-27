import { Account } from "../../domain/entities/Account";

export interface GetAccountsResponse {
    id: string;
    userId: string;
    iban: string;
    name: string | null;
    type: string;
    balance: number;
    currency: string;
    cardNumber: string | null;
    cardHolderName: string | null;
    cardExpiryDate: string | null;
    createdAt: Date;
}

export class GetAccountsResponseMapper {
    static toResponse(account: Account): GetAccountsResponse {
        return {
            id: account.id,
            userId: account.userId,
            iban: account.iban,
            name: account.name,
            type: account.type,
            balance: account.balance,
            currency: account.currency,
            cardNumber: account.cardNumber,
            cardHolderName: account.cardHolderName,
            cardExpiryDate: account.cardExpiryDate,
            createdAt: account.createdAt,
        };
    }

    static toResponseList(accounts: Account[]): GetAccountsResponse[] {
        return accounts.map(account => this.toResponse(account));
    }
}


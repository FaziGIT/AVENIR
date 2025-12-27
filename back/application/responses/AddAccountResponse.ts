import { Account } from "../../domain/entities/Account";

export interface AddAccountResponse {
    id: string;
    userId: string;
    iban: string;
    name: string | null;
    type: string;
    balance: number;
    createdAt: Date;
}

export class AddAccountResponseMapper {
    static toResponse(account: Account): AddAccountResponse {
        return {
            id: account.id,
            userId: account.userId,
            iban: account.iban,
            name: account.name,
            type: account.type,
            balance: account.balance,
            createdAt: account.createdAt,
        };
    }
}


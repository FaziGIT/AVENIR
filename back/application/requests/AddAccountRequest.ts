import { AccountType } from "../../domain/enumerations/AccountType";

export interface AddAccountRequest {
    userId: string;
    name?: string;
    type: AccountType;
}


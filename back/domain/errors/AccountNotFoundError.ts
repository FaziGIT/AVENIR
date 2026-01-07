import { DomainError } from "./DomainError";

export class AccountNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Account not found for identifier ${id}`);
    }
}

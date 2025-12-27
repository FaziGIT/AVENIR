import { DomainError } from "./DomainError";

export class AccountNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Account with id ${id} not found`);
    }
}


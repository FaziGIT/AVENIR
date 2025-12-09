import { DomainError } from "./DomainError";

export class UserNotFoundError extends DomainError {
    constructor(id: string) {
        super(`User with id ${id} not found`);
    }
}

import { DomainError } from './DomainError';

export class MessageNotFoundError extends DomainError {
    constructor() {
        super(`Message with id not found`);
    }
}

import { DomainError } from './DomainError';

export class ChatNotFoundError extends DomainError {
    constructor() {
        super(`Chat not found`);
    }
}

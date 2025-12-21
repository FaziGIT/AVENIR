import { DomainError } from './DomainError';

export class UnauthorizedChatAccessError extends DomainError {
    constructor() {
        super('You are not authorized to access this chat');
    }
}

import { DomainError } from './DomainError';

export class UnauthorizedAccountAccessError extends DomainError {
    constructor() {
        super('You are not authorized to access this account');
    }
}


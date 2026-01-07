import { DomainError } from "./DomainError";

export class BannedAccountError extends DomainError {
    constructor() {
        super("Your account has been suspended. Please contact customer service for more information.");
    }
}

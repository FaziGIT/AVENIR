import { ApplicationError } from "./ApplicationError";

export class ValidationError extends ApplicationError {
    constructor(message: string, public readonly field?: string) {
        super(message);
    }
}

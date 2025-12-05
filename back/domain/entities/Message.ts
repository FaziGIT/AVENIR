import { User } from "./User";
export class Message {
    constructor(
        readonly id: string,
        readonly sender: User,
        readonly content: string,
        readonly createdAt: Date,
    ) {}
}
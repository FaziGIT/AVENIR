import { User } from "./User";
import { Message } from "./Message";

export class Chat {
    constructor(
        readonly id: string,
        readonly advisor: User,
        readonly client: User,
        readonly messages: Message[] = [],
        readonly createdAt: Date,
    ) {}
}
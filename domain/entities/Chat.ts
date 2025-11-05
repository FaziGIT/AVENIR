import { User } from "./User";
import { Message } from "./Message";

export class Chat {
    public constructor(
        public readonly id: string,
        public readonly advisor: User,
        public readonly client: User,
        public readonly messages: Array<Message> = [],
        public readonly createdAt: Date,
    ) {}
}
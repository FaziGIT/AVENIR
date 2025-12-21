import { User } from "./User";
import { Message } from "./Message";
import { ChatStatus } from "../enumerations/ChatStatus";

export class Chat {
    constructor(
        readonly id: string,
        readonly client: User,
        readonly advisor: User | null,
        readonly status: ChatStatus,
        readonly messages: Message[] = [],
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}
}
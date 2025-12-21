import { User } from "./User";
import { MessageType } from '@avenir/shared/enums';

export class Message {
    constructor(
        readonly id: string,
        readonly chatId: string,
        readonly sender: User,
        readonly content: string,
        readonly isRead: boolean,
        readonly createdAt: Date,
        readonly type: MessageType = MessageType.NORMAL,
    ) {}
}
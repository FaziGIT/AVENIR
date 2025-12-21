import { Message } from "../entities/Message";

export interface MessageRepository {
    getById(id: string): Promise<Message | null>;
    getByChatId(chatId: string): Promise<Message[]>;
    add(message: Message): Promise<Message>;
    update(message: Message): Promise<void>;
    remove(id: string): Promise<void>;
    markAsRead(messageId: string): Promise<void>;
    markChatMessagesAsRead(chatId: string, userId: string): Promise<void>;
    getAll(): Promise<Message[]>;
}

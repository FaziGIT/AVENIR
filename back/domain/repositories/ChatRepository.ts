import { Chat } from "../entities/Chat";
import { ChatStatus } from "../enumerations/ChatStatus";

export interface ChatRepository {
    getById(id: string): Promise<Chat | null>;
    getByClientId(clientId: string): Promise<Chat[]>;
    getByAdvisorId(advisorId: string): Promise<Chat[]>;
    getPendingChats(): Promise<Chat[]>;
    getByStatus(status: ChatStatus): Promise<Chat[]>;
    add(chat: Chat): Promise<Chat>;
    update(chat: Chat): Promise<void>;
    remove(id: string): Promise<void>;
    getAll(): Promise<Chat[]>;
}

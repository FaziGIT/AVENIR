import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { GetChatsRequest } from "../../requests";
import { ChatResponse } from "../../responses";
import { Chat } from "@avenir/domain/entities/Chat";
import { UserRole } from "@avenir/domain/enumerations/UserRole";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";

export class GetChatsUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(request: GetChatsRequest): Promise<ChatResponse[]> {
        let chats: Chat[] = [];

        switch (request.userRole) {
            case UserRole.CLIENT:
                chats = await this.chatRepository.getByClientId(request.userId);
                break;
            case UserRole.ADVISOR:
                const advisorChats = await this.chatRepository.getByAdvisorId(request.userId);
                const pendingChats = await this.chatRepository.getPendingChats();
                chats = [...advisorChats, ...pendingChats];
                break;
            case UserRole.DIRECTOR:
                const activeChats = await this.chatRepository.getByStatus(ChatStatus.ACTIVE);
                const directorPendingChats = await this.chatRepository.getByStatus(ChatStatus.PENDING);
                const closedChats = await this.chatRepository.getByStatus(ChatStatus.CLOSED);
                chats = [...activeChats, ...directorPendingChats, ...closedChats];
                break;
            default:
                chats = [];
        }

        const chatResponses = await Promise.all(
            chats.map(async (chat: Chat) => {
                const messages = await this.messageRepository.getByChatId(chat.id);
                const unreadCount = messages.filter(
                    msg => !msg.isRead && msg.sender.id !== request.userId
                ).length;

                chat.messages.push(...messages);
                return ChatResponse.fromChat(chat, unreadCount);
            })
        );

        return chatResponses.sort((a: ChatResponse, b: ChatResponse) => {
            const dateA = a.lastMessageAt || a.createdAt;
            const dateB = b.lastMessageAt || b.createdAt;
            return dateB.getTime() - dateA.getTime();
        });
    }
}

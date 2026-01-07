import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { UserRepository } from "@avenir/domain/repositories/UserRepository";
import { GetChatsRequest } from "../../requests";
import { ChatResponse } from "../../responses";
import { Chat } from "@avenir/domain/entities/Chat";
import { UserRole } from "@avenir/domain/enumerations/UserRole";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";
import { UserNotFoundError } from "@avenir/domain/errors";

export class GetChatsUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository
    ) {}

    async execute(request: GetChatsRequest): Promise<ChatResponse[]> {
        const user = await this.userRepository.getById(request.userId);
        if (!user) {
            throw new UserNotFoundError(request.userId);
        }

        let chats: Chat[];

        switch (user.role) {
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

        let advisorClientIds: Set<string> = new Set();
        if (user.role === UserRole.ADVISOR) {
            const advisorClients = await this.userRepository.getClientsByAdvisorId(request.userId);
            advisorClientIds = new Set(advisorClients.map(client => client.id));
        }

        const chatResponses = await Promise.all(
            chats.map(async (chat: Chat) => {
                const messages = await this.messageRepository.getByChatId(chat.id);
                const unreadCount = messages.filter(
                    msg => !msg.isRead && msg.sender.id !== request.userId
                ).length;

                chat.messages.push(...messages);

                const isMyClient = advisorClientIds.has(chat.client.id);
                return ChatResponse.fromChat(chat, unreadCount, isMyClient);
            })
        );

        return chatResponses.sort((a: ChatResponse, b: ChatResponse) => {
            const dateA = a.lastMessageAt || a.createdAt;
            const dateB = b.lastMessageAt || b.createdAt;
            return dateB.getTime() - dateA.getTime();
        });
    }
}

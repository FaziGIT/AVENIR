import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { ChatResponse } from "../../responses";
import { ChatNotFoundError } from "@avenir/domain/errors/ChatNotFoundError";
import { UnauthorizedChatAccessError } from "@avenir/domain/errors/UnauthorizedChatAccessError";
import { UserRole } from "@avenir/domain/enumerations/UserRole";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";

export interface GetChatByIdRequest {
    chatId: string;
    userId: string;
    userRole: UserRole;
}

export class GetChatByIdUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(request: GetChatByIdRequest): Promise<ChatResponse> {
        const chat = await this.chatRepository.getById(request.chatId);
        if (!chat) {
            throw new ChatNotFoundError();
        }

        const hasAccess = this.checkAccess(
            request.userId,
            request.userRole,
            chat.client.id,
            chat.advisor?.id || null,
            chat.status
        );

        if (!hasAccess) {
            throw new UnauthorizedChatAccessError();
        }

        const messages = await this.messageRepository.getByChatId(chat.id);

        const unreadCount = messages.filter(
            msg => !msg.isRead && msg.sender.id !== request.userId
        ).length;

        chat.messages.push(...messages);
        return ChatResponse.fromChat(chat, unreadCount);
    }

    private checkAccess(
        userId: string,
        userRole: UserRole,
        clientId: string,
        advisorId: string | null,
        status: ChatStatus
    ): boolean {
        switch (userRole) {
            case UserRole.DIRECTOR:
                return true;
            case UserRole.CLIENT:
                return userId === clientId;
            case UserRole.ADVISOR:
                return advisorId === userId || status === ChatStatus.PENDING;
            default:
                return false;
        }
    }
}


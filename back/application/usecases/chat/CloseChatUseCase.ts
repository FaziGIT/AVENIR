import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { ChatNotFoundError, UnauthorizedChatAccessError } from "@avenir/domain/errors";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";
import { UserRole } from "@avenir/domain/enumerations/UserRole";

export interface CloseChatRequest {
    chatId: string;
    userId: string;
    userRole: string;
}

export class CloseChatUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
    ) {}

    async execute(request: CloseChatRequest): Promise<void> {
        const chat = await this.chatRepository.getById(request.chatId);

        if (!chat) {
            throw new ChatNotFoundError();
        }

        // Vérifier les permissions
        const canClose =
            request.userRole === UserRole.DIRECTOR ||
            (request.userRole === UserRole.ADVISOR && chat.advisor?.id === request.userId);

        if (!canClose) {
            throw new UnauthorizedChatAccessError();
        }

        // Vérifier si le chat est déjà fermé
        if (chat.status === ChatStatus.CLOSED) {
            return;
        }

        const updatedChat = new (Object.getPrototypeOf(chat).constructor)(
            chat.id,
            chat.client,
            chat.advisor,
            ChatStatus.CLOSED,
            chat.messages,
            chat.createdAt,
            new Date()
        );

        await this.chatRepository.update(updatedChat);
    }
}



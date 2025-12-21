import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { UserRepository } from "@avenir/domain/repositories/UserRepository";
import { SendMessageRequest } from "../../requests";
import { MessageResponse } from "../../responses";
import { Chat } from "@avenir/domain/entities/Chat";
import { Message } from "@avenir/domain/entities/Message";
import { ChatNotFoundError, UserNotFoundError, UnauthorizedChatAccessError } from "@avenir/domain/errors";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";
import { UserRole } from "@avenir/domain/enumerations/UserRole";
import { randomUUID } from "crypto";

export class SendMessageUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: SendMessageRequest): Promise<MessageResponse> {
        const chat = await this.chatRepository.getById(request.chatId);

        if (!chat) {
            throw new ChatNotFoundError();
        }

        const sender = await this.userRepository.getById(request.senderId);
        if (!sender) {
            throw new UserNotFoundError(request.senderId);
        }

        // Vérifier que l'utilisateur a accès à ce chat
        const isClient = chat.client.id === request.senderId;
        const isAssignedAdvisor = chat.advisor?.id === request.senderId;
        const isAdvisorOnPending = sender.role === UserRole.ADVISOR && chat.status === ChatStatus.PENDING;
        const isDirector = sender.role === UserRole.DIRECTOR;

        if (!isClient && !isAssignedAdvisor && !isAdvisorOnPending && !isDirector) {
            throw new UnauthorizedChatAccessError();
        }

        if (sender.role === UserRole.ADVISOR && chat.status === ChatStatus.PENDING) {
            const updatedChat = new Chat(
                chat.id,
                chat.client,
                sender,
                ChatStatus.ACTIVE,
                chat.messages,
                chat.createdAt,
                new Date()
            );
            await this.chatRepository.update(updatedChat);
        }

        const message = new Message(
            randomUUID(),
            request.chatId,
            sender,
            request.content,
            false,
            new Date(),
        );

        const createdMessage = await this.messageRepository.add(message);

        return MessageResponse.fromMessage(createdMessage);
    }
}

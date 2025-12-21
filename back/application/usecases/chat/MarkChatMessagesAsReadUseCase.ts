import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { ChatNotFoundError } from "@avenir/domain/errors";
import { Message } from "@avenir/domain/entities/Message";

export class MarkChatMessagesAsReadUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(chatId: string, userId: string): Promise<void> {
        const chat = await this.chatRepository.getById(chatId);
        if (!chat) {
            throw new ChatNotFoundError();
        }

        const messages = await this.messageRepository.getByChatId(chatId);

        const messagesToUpdate = messages.filter(
            msg => msg.sender.id !== userId && !msg.isRead
        );

        for (const message of messagesToUpdate) {
            const updatedMessage = new Message(
                message.id,
                message.chatId,
                message.sender,
                message.content,
                true,
                message.createdAt
            );
            await this.messageRepository.update(updatedMessage);
        }
    }
}


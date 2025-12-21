import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { MessageNotFoundError } from "@avenir/domain/errors";
import { Message } from "@avenir/domain/entities/Message";

export class MarkMessageAsReadUseCase {
    constructor(
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(messageId: string): Promise<void> {
        const message = await this.messageRepository.getById(messageId);

        if (!message) {
            throw new MessageNotFoundError();
        }

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


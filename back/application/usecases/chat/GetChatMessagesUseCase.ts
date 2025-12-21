import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { ChatNotFoundError } from "@avenir/domain/errors";
import { MessageResponse } from "../../responses";

export class GetChatMessagesUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(chatId: string, userId: string): Promise<MessageResponse[]> {
        const chat = await this.chatRepository.getById(chatId);
        if (!chat) {
            throw new ChatNotFoundError();
        }
        const messages = await this.messageRepository.getByChatId(chatId);

        await this.messageRepository.markChatMessagesAsRead(chatId, userId);

        return messages.map(msg => MessageResponse.fromMessage(msg));
    }
}

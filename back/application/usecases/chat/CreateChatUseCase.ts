import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { MessageRepository } from "@avenir/domain/repositories/MessageRepository";
import { UserRepository } from "@avenir/domain/repositories/UserRepository";
import { CreateChatRequest } from "../../requests";
import { ChatResponse } from "../../responses";
import { Chat } from "@avenir/domain/entities/Chat";
import { Message } from "@avenir/domain/entities/Message";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";
import { UserNotFoundError } from "@avenir/domain/errors";
import { randomUUID } from "crypto";

export class CreateChatUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: CreateChatRequest): Promise<ChatResponse> {
        const client = await this.userRepository.getById(request.clientId);
        if (!client) {
            throw new UserNotFoundError(request.clientId);
        }

        const now = new Date();
        const chatId = randomUUID();

        const chat = new Chat(
            chatId,
            client,
            null,
            ChatStatus.PENDING,
            [],
            now,
            now,
        );

        const createdChat = await this.chatRepository.add(chat);

        const message = new Message(
            randomUUID(),
            chatId,
            client,
            request.initialMessage,
            false,
            now,
        );

        await this.messageRepository.add(message);

        createdChat.messages.push(message);

        return ChatResponse.fromChat(createdChat);
    }
}

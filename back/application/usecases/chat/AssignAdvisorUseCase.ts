import { ChatRepository } from "@avenir/domain/repositories/ChatRepository";
import { UserRepository } from "@avenir/domain/repositories/UserRepository";
import { ChatNotFoundError, UserNotFoundError } from "@avenir/domain/errors";
import { UserRole } from "@avenir/domain/enumerations/UserRole";
import { ChatStatus } from "@avenir/domain/enumerations/ChatStatus";

export interface AssignAdvisorRequest {
    chatId: string;
    advisorId: string;
}

export class AssignAdvisorUseCase {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async execute(request: AssignAdvisorRequest): Promise<void> {
        const chat = await this.chatRepository.getById(request.chatId);

        if (!chat) {
            throw new ChatNotFoundError();
        }

        const advisor = await this.userRepository.getById(request.advisorId);

        if (!advisor || advisor.role !== UserRole.ADVISOR) {
            throw new UserNotFoundError(request.advisorId);
        }

        // Créer un nouveau chat avec le conseiller assigné
        const updatedChat = new (Object.getPrototypeOf(chat).constructor)(
            chat.id,
            chat.client,
            advisor, // Nouveau conseiller
            ChatStatus.ACTIVE,
            chat.messages,
            chat.createdAt,
            new Date()
        );

        await this.chatRepository.update(updatedChat);
    }
}


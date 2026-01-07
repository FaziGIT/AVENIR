import { Request, Response } from 'express';
import { SendMessageUseCase } from '@avenir/application/usecases/chat/SendMessageUseCase';
import { MarkMessageAsReadUseCase } from '@avenir/application/usecases/chat/MarkMessageAsReadUseCase';
import { SendMessageRequest } from '@avenir/application/requests';
import { ChatNotFoundError, UserNotFoundError, UnauthorizedChatAccessError, MessageNotFoundError } from '@avenir/domain/errors';
import { ValidationError } from '@avenir/application/errors';
import { webSocketService } from '../../services/WebSocketService';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { markMessageAsReadSchema } from '../../../../application/schemas';
import { ZodError } from 'zod';

export class MessageController {
    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly markMessageAsReadUseCase: MarkMessageAsReadUseCase,
        private readonly chatRepository: ChatRepository,
    ) {}

    async sendMessage(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const sendMessageRequest = new SendMessageRequest(
                req.body.chatId,
                req.user.userId,
                req.body.content
            );

            const response = await this.sendMessageUseCase.execute(sendMessageRequest);

            const chat = await this.chatRepository.getById(sendMessageRequest.chatId);

            const participantIds: string[] = [];
            if (chat?.client?.id) {
                participantIds.push(chat.client.id);
            }
            if (chat?.advisor?.id) {
                participantIds.push(chat.advisor.id);
            }

            const connectedDirectors = webSocketService.getConnectedDirectors();
            connectedDirectors.forEach(directorId => {
                if (!participantIds.includes(directorId)) {
                    participantIds.push(directorId);
                }
            });

            webSocketService.notifyNewMessage(
                sendMessageRequest.chatId,
                participantIds,
                response
            );

            return res.status(201).json(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
                    message: error.message,
                });
            }

            if (error instanceof UserNotFoundError) {
                return res.status(404).json({
                    error: 'User not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedChatAccessError) {
                return res.status(403).json({
                    error: 'Unauthorized',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const validatedData = markMessageAsReadSchema.parse({
                messageId: req.params.messageId,
            });

            await this.markMessageAsReadUseCase.execute(validatedData.messageId);
            return res.status(200).json({ success: true });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof MessageNotFoundError) {
                return res.status(404).json({
                    error: 'Message not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

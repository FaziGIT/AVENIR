import { Request, Response } from 'express';
import { CreateChatUseCase } from '@avenir/application/usecases/chat/CreateChatUseCase';
import { GetChatsUseCase } from '@avenir/application/usecases/chat/GetChatsUseCase';
import { GetChatByIdUseCase } from '@avenir/application/usecases/chat/GetChatByIdUseCase';
import { GetChatMessagesUseCase } from '@avenir/application/usecases/chat/GetChatMessagesUseCase';
import { MarkChatMessagesAsReadUseCase } from '@avenir/application/usecases/chat/MarkChatMessagesAsReadUseCase';
import { TransferChatUseCase } from '@avenir/application/usecases/chat/TransferChatUseCase';
import { CloseChatUseCase } from '@avenir/application/usecases/chat/CloseChatUseCase';
import { CreateChatRequest } from '@avenir/application/requests';
import { GetChatsRequest } from '@avenir/application/requests';
import { TransferChatRequest } from '@avenir/application/requests';
import { ChatNotFoundError, UnauthorizedChatAccessError, UserNotFoundError } from '@avenir/domain/errors';
import { ValidationError } from '@avenir/application/errors';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { UserRepository } from '@avenir/domain/repositories/UserRepository';
import { webSocketService } from '../../services/WebSocketService';
import {
    createChatSchema,
    getChatByIdSchema,
    closeChatSchema,
    UserRole,
} from '@avenir/shared/schemas/chat.schema';
import { ZodError } from 'zod';

export class ChatController {
    constructor(
        private readonly createChatUseCase: CreateChatUseCase,
        private readonly getChatsUseCase: GetChatsUseCase,
        private readonly getChatByIdUseCase: GetChatByIdUseCase,
        private readonly getChatMessagesUseCase: GetChatMessagesUseCase,
        private readonly markChatMessagesAsReadUseCase: MarkChatMessagesAsReadUseCase,
        private readonly transferChatUseCase: TransferChatUseCase,
        private readonly closeChatUseCase: CloseChatUseCase,
        private readonly chatRepository: ChatRepository,
        private readonly messageRepository: MessageRepository,
        private readonly userRepository: UserRepository
    ) {}

    async createChat(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const validatedData = createChatSchema.parse(req.body);
            const createChatRequest = new CreateChatRequest(
                validatedData.initialMessage,
                req.user.userId
            );

            const response = await this.createChatUseCase.execute(createChatRequest);

            // Envoyer les notifications WebSocket après la création
            const connectedAdvisors = webSocketService.getConnectedAdvisors();
            const connectedDirectors = webSocketService.getConnectedDirectors();
            const recipientIds = [...connectedAdvisors, ...connectedDirectors];

            if (recipientIds.length > 0) {
                webSocketService.notifyChatCreated(
                    response.id,
                    recipientIds,
                    {
                        id: response.id,
                        clientId: response.clientId,
                        clientName: response.clientName,
                        advisorId: response.advisorId,
                        advisorName: response.advisorName,
                        status: response.status,
                        lastMessage: response.lastMessage,
                        lastMessageAt: response.lastMessageAt,
                        unreadCount: response.unreadCount,
                        createdAt: response.createdAt,
                        updatedAt: response.updatedAt,
                    }
                );
            } else {
                console.log('No advisors/directors connected to notify');
            }

            return res.status(201).json(response);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
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

    async getChats(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const user = await this.userRepository.getById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    error: new UserNotFoundError(req.user.userId).message,
                });
            }

            const getChatsRequest: GetChatsRequest = {
                userId: req.user.userId,
                userRole: user.role,
            };

            const response = await this.getChatsUseCase.execute(getChatsRequest);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
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

    async getChatById(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const validatedData = getChatByIdSchema.parse({
                chatId: req.params.chatId,
            });

            const user = await this.userRepository.getById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    error: new UserNotFoundError(req.user.userId).message,
                });
            }

            const response = await this.getChatByIdUseCase.execute({
                chatId: validatedData.chatId,
                userId: req.user.userId,
                userRole: user.role,
            });

            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedChatAccessError) {
                return res.status(403).json({
                    error: 'Forbidden',
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

    async getChatMessages(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const { chatId } = req.params;
            const userId = req.user.userId;

            const response = await this.getChatMessagesUseCase.execute(chatId, userId);
            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
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

    async assignOrTransferChat(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const targetAdvisorId = req.body.newAdvisorId || req.body.advisorId;

            if (!targetAdvisorId) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'newAdvisorId or advisorId is required',
                });
            }

            const chatBefore = await this.chatRepository.getById(req.params.chatId);
            const oldAdvisorId = chatBefore?.advisor?.id;
            const isTransfer = !!oldAdvisorId;

            const currentUser = await this.userRepository.getById(req.user.userId);

            if (!currentUser) {
                return res.status(404).json({
                    error: new UserNotFoundError(req.user.userId).message,
                });
            }

            const currentAdvisorId = currentUser.role === UserRole.ADVISOR ? req.user.userId : undefined;

            const transferChatRequest = new TransferChatRequest(
                req.params.chatId,
                currentAdvisorId,
                targetAdvisorId
            );

            const response = await this.transferChatUseCase.execute(transferChatRequest);

            const chatAfter = await this.chatRepository.getById(req.params.chatId);

            if (chatAfter) {
                const participantIds: Set<string> = new Set();
                if (chatAfter.client?.id) {
                    participantIds.add(chatAfter.client.id);
                }
                if (oldAdvisorId && oldAdvisorId !== targetAdvisorId) {
                    participantIds.add(oldAdvisorId);
                }
                if (targetAdvisorId) {
                    participantIds.add(targetAdvisorId);
                }
                if (req.user.userId) {
                    participantIds.add(req.user.userId);
                }
                const connectedDirectors = webSocketService.getConnectedDirectors();
                connectedDirectors.forEach(directorId => {
                    participantIds.add(directorId);
                });

                const finalParticipantIds = Array.from(participantIds);

                if (isTransfer) {
                    const newAdvisor = chatAfter.advisor;
                    webSocketService.notifyChatTransferred(
                        req.params.chatId,
                        finalParticipantIds,
                        {
                            newAdvisorId: targetAdvisorId,
                            newAdvisorName: newAdvisor ? `${newAdvisor.firstName} ${newAdvisor.lastName}` : ''
                        }
                    );

                    const messages = await this.messageRepository.getByChatId(req.params.chatId);
                    if (messages && messages.length > 0) {
                        const lastMessage = messages[messages.length - 1];
                        if (lastMessage.type === 'SYSTEM') {
                            console.log('[ChatTransfer] Sending SYSTEM message notification');
                            webSocketService.notifyNewMessage(
                                req.params.chatId,
                                finalParticipantIds,
                                {
                                    id: lastMessage.id,
                                    chatId: lastMessage.chatId,
                                    senderId: lastMessage.sender.id,
                                    senderName: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
                                    senderRole: lastMessage.sender.role,
                                    content: lastMessage.content,
                                    isRead: lastMessage.isRead,
                                    type: lastMessage.type,
                                    createdAt: lastMessage.createdAt.toISOString(),
                                }
                            );
                        }
                    }
                } else {
                    const clientId = chatAfter.client?.id || '';
                    webSocketService.notifyChatAssigned(
                        req.params.chatId,
                        clientId,
                        targetAdvisorId
                    );
                }
            }

            return res.status(200).json(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
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

    async markChatMessagesAsRead(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const userId = req.user.userId;

            await this.markChatMessagesAsReadUseCase.execute(
                req.params.chatId,
                userId
            );
            return res.status(200).json({ success: true });
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
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

    async closeChat(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated',
                });
            }

            const validatedData = closeChatSchema.parse({
                chatId: req.params.chatId,
            });

            const chat = await this.chatRepository.getById(validatedData.chatId);

            if (!chat) {
                return res.status(404).json({
                    error: 'Chat not found',
                    message: 'Chat not found',
                });
            }

            const user = await this.userRepository.getById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    error: new UserNotFoundError(req.user.userId).message,
                });
            }

            await this.closeChatUseCase.execute({
                chatId: validatedData.chatId,
                userId: req.user.userId,
                userRole: user.role,
            });

            const participantIds: string[] = [];
            if (chat.client?.id) {
                participantIds.push(chat.client.id);
            }
            if (chat.advisor?.id) {
                participantIds.push(chat.advisor.id);
            }
            webSocketService.notifyChatClosed(validatedData.chatId, participantIds);

            return res.status(200).json({ success: true, message: 'Chat closed successfully' });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof ChatNotFoundError) {
                return res.status(404).json({
                    error: 'Chat not found',
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
}

import { FastifyRequest, FastifyReply } from 'fastify';
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
import { ChatNotFoundError } from '@avenir/domain/errors';
import { UnauthorizedChatAccessError } from '@avenir/domain/errors';
import { ValidationError } from '@avenir/application/errors';
import { UserRole } from '@avenir/domain/enumerations/UserRole';
import { ChatRepository } from '@avenir/domain/repositories/ChatRepository';
import { MessageRepository } from '@avenir/domain/repositories/MessageRepository';
import { webSocketService } from '../../services/WebSocketService';
import {
    createChatSchema,
    getChatsSchema,
    getChatByIdSchema,
    closeChatSchema,
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
        private readonly messageRepository: MessageRepository
    ) {}

    async createChat(request: FastifyRequest<{ Body: CreateChatRequest }>, reply: FastifyReply) {
        try {
            const validatedData = createChatSchema.parse(request.body);
            const createChatRequest: CreateChatRequest = validatedData as CreateChatRequest;
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

            reply.code(201).send(response);
        } catch (error) {
            if (error instanceof ZodError) {
                reply.code(400).send({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
                return;
            }

            if (error instanceof ValidationError) {
                reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
                return;
            }

            reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getChats(request: FastifyRequest<{ Querystring: { userId: string; userRole: string } }>, reply: FastifyReply) {
        try {
            const validatedData = getChatsSchema.parse({
                userId: request.query.userId,
                userRole: request.query.userRole,
            });
            const getChatsRequest: GetChatsRequest = {
                userId: validatedData.userId,
                userRole: validatedData.userRole as UserRole,
            };

            const response = await this.getChatsUseCase.execute(getChatsRequest);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof ZodError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getChatById(
        request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string; userRole: string } }>,
        reply: FastifyReply
    ) {
        try {
            const validatedData = getChatByIdSchema.parse({
                chatId: request.params.chatId,
                userId: request.query.userId,
            });
            const response = await this.getChatByIdUseCase.execute({
                chatId: validatedData.chatId,
                userId: validatedData.userId,
                userRole: request.query.userRole as UserRole,
            });

            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return reply.code(404).send({
                    error: 'Chat not found',
                    message: error.message,
                });
            }

            if (error instanceof UnauthorizedChatAccessError) {
                return reply.code(403).send({
                    error: 'Forbidden',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async getChatMessages(request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string } }>, reply: FastifyReply) {
        try {
            const { chatId } = request.params;
            const { userId } = request.query;

            const response = await this.getChatMessagesUseCase.execute(chatId, userId);
            return reply.code(200).send(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return reply.code(404).send({
                    error: 'Chat not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async assignOrTransferChat(
        request: FastifyRequest<{
            Params: { chatId: string };
            Body: { advisorId: string; currentUserId?: string }
        }>,
        reply: FastifyReply
    ) {
        try {
            const chatBefore = await this.chatRepository.getById(request.params.chatId);
            const oldAdvisorId = chatBefore?.advisor?.id;
            const isTransfer = !!oldAdvisorId;

            const transferChatRequest = new TransferChatRequest(
                request.params.chatId,
                request.body.currentUserId,
                request.body.advisorId
            );

            const response = await this.transferChatUseCase.execute(transferChatRequest);

            const chatAfter = await this.chatRepository.getById(request.params.chatId);

            if (chatAfter) {
                const participantIds: Set<string> = new Set();
                if (chatAfter.client?.id) {
                    participantIds.add(chatAfter.client.id);
                }
                if (oldAdvisorId && oldAdvisorId !== request.body.advisorId) {
                    participantIds.add(oldAdvisorId);
                }
                if (request.body.advisorId) {
                    participantIds.add(request.body.advisorId);
                }
                if (request.body.currentUserId) {
                    participantIds.add(request.body.currentUserId);
                }
                const connectedDirectors = webSocketService.getConnectedDirectors();
                connectedDirectors.forEach(directorId => {
                    participantIds.add(directorId);
                });

                const finalParticipantIds = Array.from(participantIds);

                if (isTransfer) {
                    const newAdvisor = chatAfter.advisor;
                    webSocketService.notifyChatTransferred(
                        request.params.chatId,
                        finalParticipantIds,
                        {
                            newAdvisorId: request.body.advisorId,
                            newAdvisorName: newAdvisor ? `${newAdvisor.firstName} ${newAdvisor.lastName}` : ''
                        }
                    );

                    const messages = await this.messageRepository.getByChatId(request.params.chatId);
                    if (messages && messages.length > 0) {
                        const lastMessage = messages[messages.length - 1];
                        if (lastMessage.type === 'SYSTEM') {
                            console.log('[ChatTransfer] Sending SYSTEM message notification');
                            webSocketService.notifyNewMessage(
                                request.params.chatId,
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
                        request.params.chatId,
                        clientId,
                        request.body.advisorId
                    );
                }
            }

            reply.code(200).send(response);
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                reply.code(404).send({
                    error: 'Chat not found',
                    message: error.message,
                });
                return;
            }

            if (error instanceof UnauthorizedChatAccessError) {
                reply.code(403).send({
                    error: 'Unauthorized',
                    message: error.message,
                });
                return;
            }

            if (error instanceof ValidationError) {
                reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
                return;
            }

            reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async markChatMessagesAsRead(
        request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string } }>,
        reply: FastifyReply
    ) {
        try {
            await this.markChatMessagesAsReadUseCase.execute(
                request.params.chatId,
                request.query.userId
            );
            return reply.code(200).send({ success: true });
        } catch (error) {
            if (error instanceof ChatNotFoundError) {
                return reply.code(404).send({
                    error: 'Chat not found',
                    message: error.message,
                });
            }

            if (error instanceof ValidationError) {
                return reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
            }

            return reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    async closeChat(
        request: FastifyRequest<{
            Params: { chatId: string };
            Body: { userId: string; userRole?: string }
        }>,
        reply: FastifyReply
    ) {
        try {
            const validatedData = closeChatSchema.parse({
                chatId: request.params.chatId,
                userId: request.body.userId,
                userRole: request.body.userRole || 'ADVISOR',
            });

            const chat = await this.chatRepository.getById(validatedData.chatId);

            if (!chat) {
                reply.code(404).send({
                    error: 'Chat not found',
                    message: 'Chat not found',
                });
                return;
            }

            await this.closeChatUseCase.execute({
                chatId: validatedData.chatId,
                userId: validatedData.userId,
                userRole: validatedData.userRole,
            });

            const participantIds: string[] = [];
            if (chat.client?.id) {
                participantIds.push(chat.client.id);
            }
            if (chat.advisor?.id) {
                participantIds.push(chat.advisor.id);
            }
            webSocketService.notifyChatClosed(validatedData.chatId, participantIds);

            reply.code(200).send({ success: true, message: 'Chat closed successfully' });
        } catch (error) {
            if (error instanceof ZodError) {
                reply.code(400).send({
                    error: 'Validation error',
                    message: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
                });
                return;
            }

            if (error instanceof ChatNotFoundError) {
                reply.code(404).send({
                    error: 'Chat not found',
                    message: error.message,
                });
                return;
            }

            if (error instanceof UnauthorizedChatAccessError) {
                reply.code(403).send({
                    error: 'Unauthorized',
                    message: error.message,
                });
                return;
            }

            if (error instanceof ValidationError) {
                reply.code(400).send({
                    error: 'Validation error',
                    message: error.message,
                });
                return;
            }

            reply.code(500).send({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

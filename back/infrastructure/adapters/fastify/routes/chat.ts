import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { ChatController } from '../controllers/ChatController';
import { CreateChatRequest } from '@avenir/application/requests';

export async function chatRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & {
        chatController: ChatController;
    }
) {
    const { chatController } = options;

    fastify.post(
        '/chats',
        async (request: FastifyRequest<{ Body: CreateChatRequest }>, reply: FastifyReply) => {
            return chatController.createChat(request, reply);
        }
    );

    fastify.get(
        '/chats',
        async (
            request: FastifyRequest<{ Querystring: { userId: string; userRole: string } }>,
            reply: FastifyReply
        ) => {
            return chatController.getChats(request, reply);
        }
    );

    fastify.get(
        '/chats/:chatId',
        async (
            request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string; userRole: string } }>,
            reply: FastifyReply
        ) => {
            return chatController.getChatById(request, reply);
        }
    );

    fastify.get(
        '/chats/:chatId/messages',
        async (
            request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string } }>,
            reply: FastifyReply
        ) => {
            return chatController.getChatMessages(request, reply);
        }
    );

    fastify.put(
        '/chats/:chatId/transfer',
        async (
            request: FastifyRequest<{
                Params: { chatId: string };
                Body: { newAdvisorId: string; currentUserId: string }
            }>,
            reply: FastifyReply
        ) => {
            const transferChatRequest = {
                params: { chatId: request.params.chatId },
                body: {
                    advisorId: request.body.newAdvisorId,
                    currentUserId: request.body.currentUserId
                }
            };
            return chatController.assignOrTransferChat(transferChatRequest as any, reply);
        }
    );

    fastify.put(
        '/chats/:chatId/assign',
        async (
            request: FastifyRequest<{
                Params: { chatId: string };
                Body: { advisorId: string }
            }>,
            reply: FastifyReply
        ) => {
            return chatController.assignOrTransferChat(request, reply);
        }
    );

    fastify.put(
        '/chats/:chatId/messages/read',
        async (
            request: FastifyRequest<{ Params: { chatId: string }; Querystring: { userId: string } }>,
            reply: FastifyReply
        ) => {
            return chatController.markChatMessagesAsRead(request, reply);
        }
    );

    fastify.put(
        '/chats/:chatId/close',
        async (
            request: FastifyRequest<{
                Params: { chatId: string };
                Body: { userId: string; userRole?: string }
            }>,
            reply: FastifyReply
        ) => {
            return chatController.closeChat(request, reply);
        }
    );
}

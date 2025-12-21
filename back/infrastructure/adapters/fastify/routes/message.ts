import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { MessageController } from '../controllers/MessageController';
import { SendMessageRequest } from '@avenir/application/requests';

export async function messageRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions & { messageController: MessageController }
) {
    const { messageController } = options;

    fastify.post(
        '/messages',
        async (request: FastifyRequest<{ Body: SendMessageRequest }>, reply: FastifyReply) => {
            return messageController.sendMessage(request, reply);
        }
    );

    fastify.put(
        '/messages/:messageId/read',
        async (request: FastifyRequest<{ Params: { messageId: string } }>, reply: FastifyReply) => {
            return messageController.markAsRead(request, reply);
        }
    );
}


import { z } from 'zod';
import { UserRole, ChatStatus } from '../enums';

export { UserRole, ChatStatus };

const idSchema = z.string().min(1, 'ID cannot be empty').refine(
    (id) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const mockIdRegex = /^(client|adv|dir|chat|msg)(-[a-z0-9]+)+$/i;
        return uuidRegex.test(id) || mockIdRegex.test(id);
    },
    { message: 'Invalid ID format (must be UUID or mock ID like client-001 or chat-pending-1)' }
);

// SCHÉMAS DE VALIDATION CHAT
export const createChatSchema = z.object({
    clientId: idSchema,
    initialMessage: z.string().min(1, 'Initial message cannot be empty').max(5000, 'Message is too long'),
});

export const sendMessageSchema = z.object({
    chatId: idSchema,
    senderId: idSchema,
    content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
});

export const getChatsSchema = z.object({
    userId: idSchema,
    userRole: z.enum(['CLIENT', 'ADVISOR', 'DIRECTOR']),
});

export const getChatByIdSchema = z.object({
    chatId: idSchema,
    userId: idSchema,
});

export const transferChatSchema = z.object({
    chatId: idSchema,
    newAdvisorId: idSchema,
});

export const markMessageAsReadSchema = z.object({
    messageId: idSchema,
});

export const markChatMessagesAsReadSchema = z.object({
    chatId: idSchema,
    userId: idSchema,
});

export const closeChatSchema = z.object({
    chatId: idSchema,
    userId: idSchema,
    userRole: z.enum(UserRole),
});


export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type GetChatsInput = z.infer<typeof getChatsSchema>;
export type GetChatByIdInput = z.infer<typeof getChatByIdSchema>;
export type TransferChatInput = z.infer<typeof transferChatSchema>;
export type MarkMessageAsReadInput = z.infer<typeof markMessageAsReadSchema>;
export type MarkChatMessagesAsReadInput = z.infer<typeof markChatMessagesAsReadSchema>;
export type CloseChatInput = z.infer<typeof closeChatSchema>;

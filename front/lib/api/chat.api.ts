import {
  createChatSchema,
  sendMessageSchema,
  getChatsSchema,
  getChatByIdSchema,
  transferChatSchema,
  closeChatSchema,
  markMessageAsReadSchema,
} from '@avenir/shared/schemas/chat.schema';
import {UserRole} from "@avenir/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface SendMessageDto {
  chatId: string;
  senderId: string;
  content: string;
}

export interface CreateChatDto {
  clientId: string;
  initialMessage: string;
}

export interface GetChatsParams {
  userId: string;
  userRole: string;
}

export interface CloseChatDto {
  chatId: string;
  userId: string;
  userRole: UserRole;
}

export interface TransferChatDto {
  chatId: string;
  newAdvisorId: string;
  currentUserId: string;
}

export interface AssignAdvisorDto {
  chatId: string;
  advisorId: string;
}

export const chatApi = {
  async getChats(params: GetChatsParams) {
    const validatedParams = getChatsSchema.parse(params);
    const response = await fetch(
      `${API_BASE_URL}/chats?userId=${validatedParams.userId}&userRole=${validatedParams.userRole}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
  },

  async getChatById(chatId: string, userId: string, userRole: string) {
    const validatedData = getChatByIdSchema.parse({ chatId, userId });
    const response = await fetch(
      `${API_BASE_URL}/chats/${validatedData.chatId}?userId=${validatedData.userId}&userRole=${userRole}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('[chatApi.getChatById] Error:', { chatId, userId, status: response.status });
      throw new Error(`Failed to fetch chat: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  async getChatMessages(chatId: string, userId: string) {
    const validatedData = getChatByIdSchema.parse({ chatId, userId });
    const response = await fetch(
      `${API_BASE_URL}/chats/${validatedData.chatId}/messages?userId=${validatedData.userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  },

  async sendMessage(data: SendMessageDto) {
    const validatedData = sendMessageSchema.parse(data);
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  },

  async createChat(data: CreateChatDto) {
    const validatedData = createChatSchema.parse(data);
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  },

  async closeChat(data: CloseChatDto) {
    const validatedData = closeChatSchema.parse(data);
    const response = await fetch(`${API_BASE_URL}/chats/${validatedData.chatId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: validatedData.userId,
        userRole: validatedData.userRole,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to close chat');
    }

    return response.json();
  },

  async transferChat(data: TransferChatDto) {
    const validatedData = transferChatSchema.parse({
      chatId: data.chatId,
      newAdvisorId: data.newAdvisorId,
    });
    const response = await fetch(`${API_BASE_URL}/chats/${validatedData.chatId}/transfer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newAdvisorId: validatedData.newAdvisorId,
        currentUserId: data.currentUserId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to transfer chat');
    }

    return response.json();
  },

  async assignAdvisor(data: AssignAdvisorDto) {
    const response = await fetch(`${API_BASE_URL}/chats/${data.chatId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ advisorId: data.advisorId }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign advisor');
    }

    return response.json();
  },

  async markMessageAsRead(messageId: string) {
    const validatedData = markMessageAsReadSchema.parse({ messageId });

    const response = await fetch(`${API_BASE_URL}/messages/${validatedData.messageId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }

    return response.json();
  },
};

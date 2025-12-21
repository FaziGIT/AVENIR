// Types partagés pour le système de chat
import { UserRole, UserState, ChatStatus, MessageType } from './enums';
export { UserRole, UserState, ChatStatus, MessageType };

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  identityNumber: string;
  role: UserRole;
  state: UserState;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  content: string;
  isRead: boolean;
  type: MessageType;
  createdAt: Date;
}

export interface Chat {
  id: string;
  clientId: string;
  client?: User;
  advisorId: string | null;
  advisor?: User | null;
  status: ChatStatus;
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock user pour le développement
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  identityNumber: string;
  role: UserRole;
}

export const MOCK_USERS: Record<UserRole, MockUser> = {
  CLIENT: {
    id: 'client-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    identityNumber: 'CLI001',
    role: UserRole.CLIENT,
  },
  ADVISOR: {
    id: 'adv-001',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@avenir-bank.fr',
    identityNumber: 'ADV001',
    role: UserRole.ADVISOR,
  },
  DIRECTOR: {
    id: 'dir-001',
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@avenir-bank.fr',
    identityNumber: 'DIR001',
    role: UserRole.DIRECTOR,
  },
};

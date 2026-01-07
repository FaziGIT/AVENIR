import { AdvisorClient } from './advisor.api';
import { ClientLoan } from '@/types/client';
import { Chat } from '@/types/chat';
import { UserRole, UserState } from '@avenir/shared/enums';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChatFromAPI extends Omit<Chat, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface LoanFromAPI extends Omit<ClientLoan, 'createdAt' | 'endDate' | 'nextPaymentDate'> {
  createdAt: string;
  endDate: string;
  nextPaymentDate?: string;
}

interface ClientFromAPI {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  state: string;
  identityNumber?: string;
  createdAt: string;
  updatedAt: string;
  chats: ChatFromAPI[];
  loans: LoanFromAPI[];
}

interface GetAllClientsResponse {
  clients: ClientFromAPI[];
}

export interface UpdateClientData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateClientData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const getAllClients = async (directorId: string): Promise<AdvisorClient[]> => {
  const response = await fetch(`${API_URL}/api/directors/${directorId}/clients`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch all clients');
  }

  const data: GetAllClientsResponse = await response.json();

  return data.clients.map((client): AdvisorClient => ({
    ...client,
    role: client.role as UserRole,
    state: client.state as UserState,
    identityNumber: client.identityNumber || '',
    createdAt: new Date(client.createdAt),
    updatedAt: new Date(client.updatedAt),
    chats: client.chats.map((chat): Chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    })),
    loans: client.loans.map((loan): ClientLoan => {
      const loanData = loan as unknown as Record<string, unknown>;
      const endDate = new Date(loan.endDate);

      return {
        ...loan,
        interestRate: (loanData.annualInterestRate as number) || loan.interestRate || 0,
        createdAt: new Date(loan.createdAt),
        endDate: endDate,
        nextPaymentDate: loan.nextPaymentDate ? new Date(loan.nextPaymentDate) : undefined,
      };
    }),
  }));
};

// Bannir un client
export const banClient = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/ban`, {
    method: 'PUT',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to ban client');
  }
};

// Activer un client
export const activateClient = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${userId}/activate`, {
    method: 'PUT',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to activate client');
  }
};

// Supprimer un client
export const deleteClient = async (userId: string, transferIBAN: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ transferIBAN }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to delete client');
  }
};

export const updateClient = async (userId: string, data: UpdateClientData): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to update client');
  }
};

export const createClient = async (data: CreateClientData): Promise<void> => {
  const response = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ ...data, role: 'CLIENT' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to create client');
  }
};

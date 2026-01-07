import { User } from '@/types/chat';
import { mapUsersFromApi, mapUserFromApi } from '@/lib/mapping/chat.mapper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface GetUsersParams {
  role?: string;
}

export const userApi = {
  async getUsers(params?: GetUsersParams): Promise<User[]> {
    const queryParams = new URLSearchParams();
    if (params?.role) {
      queryParams.append('role', params.role);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return mapUsersFromApi(Array.isArray(data) ? data : []);
  },

  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    return mapUserFromApi(data);
  },

  async deleteMyAccount(transferIBAN: string): Promise<void> {
    // Récupérer l'ID de l'utilisateur connecté
    const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get current user');
    }

    const userData = await userResponse.json();
    const userId = userData.user.id;

    // Supprimer le compte
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ transferIBAN }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Failed to delete account');
    }
  },
};

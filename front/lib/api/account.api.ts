import { AccountType } from '@/types/enums';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api';

// Helper to clear auth cookies client-side
const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Internal refresh token function
const internalRefreshToken = async (): Promise<boolean> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        clearAuthCookies();
        return false;
      }

      return true;
    } catch (error) {
      clearAuthCookies();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Helper function for authenticated fetch with error handling and token refresh
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const hasBody = options.body !== undefined && options.body !== null;
  const headers: HeadersInit = {
    ...(hasBody && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  // If 401 and not already a refresh endpoint, try to refresh and retry once
  if (res.status === 401 && !url.includes('/auth/refresh')) {
    const refreshSuccess = await internalRefreshToken();

    if (refreshSuccess) {
      // Retry the original request
      const hasBody = options.body !== undefined && options.body !== null;
      const retryHeaders: HeadersInit = {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...options.headers,
      };

      const retryRes = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: retryHeaders,
      });

      if (!retryRes.ok) {
        const error = await retryRes.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `Request failed with status ${retryRes.status}`);
      }

      return retryRes;
    } else {
      // Refresh failed, clear cookies and throw
      clearAuthCookies();
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `Request failed with status ${res.status}`);
  }

  return res;
};

export interface Account {
  id: string;
  userId: string;
  iban: string;
  name: string | null;
  type: AccountType;
  balance: number;
  currency: string;
  cardNumber: string | null;
  cardHolderName: string | null;
  cardExpiryDate: string | null;
  createdAt: string;
}

export interface AddAccountRequest {
  name?: string;
  type: AccountType;
}

export const accountApi = {
  async getAccounts(): Promise<Account[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts`, {
      method: 'GET',
    });

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async addAccount(request: AddAccountRequest): Promise<Account> {
    const response = await fetchWithAuth(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response.json();
  },

  async deleteAccount(accountId: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'DELETE',
    });
  },

  async updateAccountName(accountId: string, name: string | null): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/accounts/${accountId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },
};


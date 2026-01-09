const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
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

// Fetch with auto-retry on 401
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // If 401 and not already a refresh endpoint, try to refresh and retry once
  if (res.status === 401 && !url.includes('/auth/refresh')) {
    const refreshSuccess = await internalRefreshToken();

    if (refreshSuccess) {
      // Retry the original request
      return fetch(url, {
        ...options,
        credentials: 'include',
      });
    } else {
      // Refresh failed, clear cookies and throw
      clearAuthCookies();
    }
  }

  return res;
};

export const api = {
  // Clear authentication cookies
  clearCookies: clearAuthCookies,

  // Verify email and create session
  verifyEmail: async (token: string) => {
    const res = await fetch(`${API_URL}/api/verify-email?token=${token}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    const res = await fetchWithAuth(`${API_URL}/api/auth/me`);

    if (!res.ok) {
      const error: any = new Error('Authentication failed');
      error.status = res.status;
      throw error;
    }
    return res.json();
  },

  // Logout
  logout: async () => {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    clearAuthCookies();
    return res.json();
  },

  // Refresh token
  refreshToken: async () => {
    return internalRefreshToken();
  },
};

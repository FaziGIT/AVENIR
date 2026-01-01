const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response | null> => {
  const maxRetries = 1;

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401 && retryCount < maxRetries) {
      if (isRefreshing && refreshPromise) {
        const success = await refreshPromise;
        return success ? fetchWithAuth(url, options, retryCount + 1) : null;
      }

      isRefreshing = true;
      refreshPromise = refreshAccessToken();

      const success = await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      if (success) {
        return fetchWithAuth(url, options, retryCount + 1);
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return response;
  } catch {
    return null;
  }
};

export const fetchJSON = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T | null> => {
  const response = await fetchWithAuth(url, options);

  if (!response?.ok) return null;

  try {
    return response.json();
  } catch {
    return null;
  }
};

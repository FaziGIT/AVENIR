import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthCookies = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
};

export const fetchAuthStatus = async (): Promise<{ isAuthenticated: boolean }> => {
  try {
    const authCookies = await getAuthCookies();
    if (!authCookies) return { isAuthenticated: false };

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookies,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    return { isAuthenticated: response.ok };
  } catch {
    return { isAuthenticated: false };
  }
};

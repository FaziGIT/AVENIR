'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDirector: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify-email'];
const NO_AUTH_CHECK_PATHS = ['/login', '/register'];

const isPublicPath = (pathname: string): boolean => PUBLIC_PATHS.includes(pathname);
const shouldSkipAuthCheck = (pathname: string): boolean => NO_AUTH_CHECK_PATHS.includes(pathname);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Skip auth check only on login/register pages to avoid unnecessary 401
    if (shouldSkipAuthCheck(currentPath)) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await api.getCurrentUser();
      setUser(userData?.user || null);
    } catch (error: any) {
      setUser(null);
      // Clear cookies on authentication failure
      api.clearCookies();

      // Only redirect if on a protected page
      if (error?.status === 401 && !isPublicPath(window.location.pathname)) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!user) return;

    // Refresh token every 10 minutes
    const interval = setInterval(async () => {
      const refreshSuccess = await api.refreshToken();

      // If token refresh fails, clear cookies and redirect to login
      if (!refreshSuccess) {
        api.clearCookies();
        setUser(null);
        router.push('/login');
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, router]);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    api.clearCookies();
    setUser(null);
    router.push('/login');
  }, [router]);

  const isDirector = user?.role === 'DIRECTOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isDirector,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { UserRole } from '@/types/enums';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  state: string;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshAuth = useCallback(async () => {
    try {
      const userData = await api.getCurrentUser();
      const fetchedUser = userData?.user || null;

      if (fetchedUser && fetchedUser.state === 'BANNED') {
        api.clearCookies();
        setUser(null);

        window.location.href = '/banned';
        return;
      }

      setUser(fetchedUser);
    } catch {
      setUser(null);
      api.clearCookies();
    } finally {
      setIsLoading(false);
    }
  }, []);

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

'use client';

import { useState, useEffect } from 'react';
import { UserRole, MOCK_USERS, MockUser } from '@/types/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown } from 'lucide-react';

const USER_STORAGE_KEY = 'avenir_dev_current_user';

const getInitialUser = (): MockUser => {
  if (typeof window === 'undefined') return MOCK_USERS.CLIENT;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : MOCK_USERS.CLIENT;
};

export const DevUserSwitcher = () => {
  const [currentUser, setCurrentUser] = useState<MockUser>(getInitialUser);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(MOCK_USERS.CLIENT));
    }
  }, []);

  const handleUserChange = (role: UserRole) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setIsOpen(false);
    window.location.reload();
  };

  if (!currentUser) return null;

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'ADVISOR':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'CLIENT':
        return 'bg-green-500 hover:bg-green-600';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'DIRECTOR':
        return 'bg-purple-100 text-purple-700';
      case 'ADVISOR':
        return 'bg-blue-100 text-blue-700';
      case 'CLIENT':
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl"
            >
              <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Changer d&apos;utilisateur (DEV)
              </p>
              <div className="space-y-2">
                {Object.entries(MOCK_USERS).map(([role, user]) => (
                  <button
                    key={role}
                    onClick={() => handleUserChange(role as UserRole)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      currentUser.role === role
                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                          {currentUser.role === role && (
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(
                          role as UserRole
                        )}`}
                      >
                        {role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg transition-all ${getRoleColor(
            currentUser.role
          )}`}
        >
          <Users className="h-5 w-5" />
          <span className="font-medium text-sm">
            {currentUser.firstName} ({currentUser.role})
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </motion.button>
      </div>
    </div>
  );
};

export const useCurrentMockUser = (): MockUser | null => {
  const [mounted, setMounted] = useState(false);
  const [currentUser] = useState<MockUser | null>(() => {
    if (typeof window === 'undefined') return MOCK_USERS.CLIENT;
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_USERS.CLIENT;
  });

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) return MOCK_USERS.CLIENT;
  return currentUser;
};

export default DevUserSwitcher;

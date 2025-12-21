'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Search } from 'lucide-react';
import { User } from '@/types/chat';
import { userApi } from '@/lib/api/user.api';
import { useTranslation } from 'react-i18next';

interface AssignAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (advisorId: string) => void;
  isLoading?: boolean;
  currentAdvisorId?: string | null;
}

export const AssignAdvisorModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  currentAdvisorId,
}: AssignAdvisorModalProps) => {
  const { t } = useTranslation();
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(false);

  const loadAdvisors = useCallback(async () => {
    try {
      setIsLoadingAdvisors(true);
      const response = await userApi.getUsers({ role: 'ADVISOR' });
      setAdvisors(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading advisors:', error);
    } finally {
      setIsLoadingAdvisors(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAdvisors();
      setSelectedAdvisorId('');
      setSearchQuery('');
    }
  }, [isOpen, currentAdvisorId, loadAdvisors]);

  const handleSubmit = () => {
    if (selectedAdvisorId) {
      onSubmit(selectedAdvisorId);
      setSelectedAdvisorId('');
      setSearchQuery('');
    }
  };

  const handleClose = () => {
    setSelectedAdvisorId('');
    setSearchQuery('');
    onClose();
  };

  const filteredAdvisors = advisors.filter(
    (advisor) =>
      `${advisor.firstName} ${advisor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      advisor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t('chat.modals.assign.title')}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t('chat.modals.assign.description')}
              </p>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('chat.searchAdvisor')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            <div className="mb-6 max-h-64 space-y-2 overflow-y-auto">
              {isLoadingAdvisors ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                  <p className="mt-3 text-sm text-gray-500">{t('common.loading')}</p>
                </div>
              ) : filteredAdvisors.length === 0 ? (
                <div className="py-8 text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    {t('chat.noAdvisorAvailable')}
                  </p>
                </div>
              ) : (
                filteredAdvisors.map((advisor) => {
                  const isCurrentAdvisor = currentAdvisorId === advisor.id;

                  return (
                    <button
                      key={advisor.id}
                      onClick={() => !isCurrentAdvisor && setSelectedAdvisorId(advisor.id)}
                      disabled={isCurrentAdvisor}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        isCurrentAdvisor
                          ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                          : selectedAdvisorId === advisor.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${
                          isCurrentAdvisor 
                            ? 'bg-red-500 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {advisor.firstName[0]}
                          {advisor.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${
                              isCurrentAdvisor ? 'text-red-700' : 'text-gray-900'
                            }`}>
                              {advisor.firstName} {advisor.lastName}
                            </p>
                            {isCurrentAdvisor && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                {t('chat.alreadyAssigned')}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${
                            isCurrentAdvisor ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {advisor.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedAdvisorId || isLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? t('chat.actions.assigning') : t('chat.actions.assign')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

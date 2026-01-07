'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { deleteUserWithIBANSchema } from '@avenir/shared/schemas/user.schema';
import { z } from 'zod';

const deleteAccountSchema = deleteUserWithIBANSchema.pick({ transferIBAN: true });

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (iban: string) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteAccountModalProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
  });

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setError(null);
      onClose();
    }
  };

  const onSubmit = async (data: DeleteAccountFormData) => {
    try {
      setError(null);
      await onConfirm(data.transferIBAN);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="mb-2 text-center text-xl font-semibold text-gray-900">
                {t('account.deleteAccount.title')}
              </h3>

              {/* Warning message */}
              <p className="mb-4 text-left text-sm text-gray-600 whitespace-pre-line">
                {t('account.deleteAccount.warning')}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* IBAN Input */}
                <div>
                  <label htmlFor="transferIBAN" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('account.deleteAccount.ibanLabel')}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <input
                      {...register('transferIBAN')}
                      id="transferIBAN"
                      type="text"
                      placeholder="FR76 3000 6000 0112 3456 7890 189"
                      disabled={isLoading}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:opacity-50"
                    />
                  </div>
                  {errors.transferIBAN && (
                    <p className="mt-1 text-xs text-red-600">{errors.transferIBAN.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {t('account.deleteAccount.ibanHelp')}
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? t('common.loading') : t('account.deleteAccount.confirm')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

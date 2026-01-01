'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModalContainer } from '@/components/ui/modal-container';
import { AlertMessage } from '@/components/ui/alert-message';
import * as z from 'zod';

interface DeleteStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  stockSymbol: string;
  isLoading?: boolean;
  error?: string;
}

const deleteStockSchema = z.object({
  verificationText: z.string().min(1, 'Le texte de vérification est requis'),
});

type DeleteStockFormData = z.infer<typeof deleteStockSchema>;

export const DeleteStockModal = ({
  isOpen,
  onClose,
  onConfirm,
  stockSymbol,
  isLoading = false,
  error,
}: DeleteStockModalProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DeleteStockFormData>({
    resolver: zodResolver(deleteStockSchema),
    defaultValues: {
      verificationText: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      setCopied(false);
    }
  }, [isOpen, reset]);

  const verificationText = watch('verificationText');
  const confirmationText = t('admin.stock.deleteConfirmationText').replace('{{symbol}}', stockSymbol);
  const isVerified = verificationText === confirmationText;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(confirmationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onFormSubmit = async () => {
    if (!isVerified || isLoading) return;
    try {
      await onConfirm();
      // Success: reset form and close modal
      reset();
      setCopied(false);
      onClose();
    } catch (error) {
      // Error: keep modal open, error is displayed via error prop
      console.error('Delete failed:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setCopied(false);
      onClose();
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={t('admin.stock.deleteTitle')}
      maxWidth="md"
      disabled={isLoading}
    >
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {t('admin.stock.deleteConfirmation').replace('{{symbol}}', stockSymbol)}
          </p>
          <p className="mt-2 text-sm font-semibold text-red-600">
            {t('admin.stock.deleteWarning')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-red-900">
                      {t('admin.stock.verificationLabel')}
                    </label>
                    <div className="flex items-center gap-2 rounded-lg bg-white p-3 border border-red-200">
                      <span className="flex-1 text-sm text-red-600 break-all">{confirmationText}</span>
                      <motion.button
                        type="button"
                        onClick={handleCopy}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="verificationText" className="text-sm font-medium text-red-900">
                      {t('admin.stock.verificationInput')}
                    </label>
                    <input
                      id="verificationText"
                      type="text"
                      {...register('verificationText')}
                      placeholder={t('admin.stock.verificationPlaceholder')}
                      disabled={isLoading}
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                        verificationText && !isVerified
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : verificationText && isVerified
                          ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } focus:outline-none`}
                    />
                    {verificationText && !isVerified && (
                      <p className="text-xs text-red-600">{t('admin.stock.verificationError')}</p>
                    )}
                    {isVerified && (
                      <p className="text-xs text-green-600">{t('admin.stock.verificationSuccess')}</p>
                    )}
                    {errors.verificationText && (
                      <p className="text-xs text-red-600">{errors.verificationText.message}</p>
                    )}
                  </div>
                </motion.div>

        {error && <AlertMessage type="error" message={error} />}

                <div className="flex gap-3 pt-2">
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
                    disabled={isLoading || !isVerified}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-red-700 hover:to-red-800 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('common.deleting')}
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        {t('admin.stock.delete')}
                      </>
                    )}
                  </button>
        </div>
      </form>
    </ModalContainer>
  );
};

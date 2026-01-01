'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { StockAdminModal } from './stock-admin-modal';
import { InactiveStocksModal } from './inactive-stocks-modal';
import type { CreateStockFormInput, UpdateStockFormInput } from '@avenir/shared/schemas/stock.schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StockAdminPanelProps {
  onStockChange?: () => void;
}

export const StockAdminPanel = ({ onStockChange }: StockAdminPanelProps) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleCreateStock = async (data: CreateStockFormInput | UpdateStockFormInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/investment/admin/stocks`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('admin.stock.createError'));
      }

      showSuccessMessage(t('admin.stock.createSuccess').replace('{{symbol}}', data.symbol || ''));
      setIsModalOpen(false);
      if (onStockChange) onStockChange();
    } catch (err: any) {
      setError(err.message || t('admin.stock.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 mb-6 rounded-2xl border bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('admin.stock.title')}</h3>
            <p className="text-sm text-gray-500">{t('admin.stock.description')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInactiveModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              {t('admin.stock.viewInactive')}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4" />
              {t('admin.stock.createNew')}
            </button>
          </div>
        </div>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800"
          >
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800"
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      <StockAdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        onSubmit={handleCreateStock}
        mode="create"
        isLoading={isSubmitting}
      />

      <InactiveStocksModal
        isOpen={isInactiveModalOpen}
        onClose={() => setIsInactiveModalOpen(false)}
        onStockReactivated={() => {
          if (onStockChange) onStockChange();
        }}
      />
    </>
  );
};

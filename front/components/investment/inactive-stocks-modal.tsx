'use client';

import React, { useState, useEffect } from 'react';
import { Power, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { ModalContainer } from '@/components/ui/modal-container';
import { AlertMessage } from '@/components/ui/alert-message';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

interface InactiveStock {
  id: string;
  symbol: string;
  name: string;
  isin: string;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface InactiveStocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockReactivated?: () => void;
}

export const InactiveStocksModal = ({
  isOpen,
  onClose,
  onStockReactivated,
}: InactiveStocksModalProps) => {
  const { t } = useLanguage();
  const [inactiveStocks, setInactiveStocks] = useState<InactiveStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReactivating, setIsReactivating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchInactiveStocks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/admin/stocks`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }

      const stocks = await response.json();
      const inactive = stocks.filter((stock: any) => !stock.isActive);
      setInactiveStocks(inactive);
    } catch (err: any) {
      setError(err.message || t('admin.stock.fetchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async (stockId: string, symbol: string) => {
    setIsReactivating(stockId);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/investment/admin/stocks/${stockId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: true,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || t('admin.stock.reactivateError'));
      }

      setSuccessMessage(t('admin.stock.reactivateSuccess').replace('{{symbol}}', symbol));
      await fetchInactiveStocks();

      if (onStockReactivated) {
        onStockReactivated();
      }

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.message || t('admin.stock.reactivateError'));
    } finally {
      setIsReactivating(null);
    }
  };

  const handleClose = () => {
    if (!isReactivating) {
      setError('');
      setSuccessMessage('');
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInactiveStocks();
    }
  }, [isOpen]);

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={t('admin.stock.inactiveStocksTitle')}
      description={t('admin.stock.inactiveStocksDescription')}
      maxWidth="4xl"
      disabled={!!isReactivating}
    >
      {successMessage && <AlertMessage type="success" message={successMessage} />}
      {error && <AlertMessage type="error" message={error} />}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="mt-4 text-sm text-gray-500">{t('common.loading')}</p>
                </div>
              ) : inactiveStocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm font-medium text-gray-900">
                    {t('admin.stock.noInactiveStocks')}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('admin.stock.noInactiveStocksDescription')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('admin.stock.symbol')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('admin.stock.name')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('admin.stock.isin')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('admin.stock.currentPrice')}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          {t('admin.stock.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {inactiveStocks.map((stock) => (
                        <tr key={stock.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              {stock.symbol}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-700">{stock.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-xs text-gray-500">{stock.isin}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-medium text-gray-900">
                              {stock.currentPrice.toFixed(2)}€
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleReactivate(stock.id, stock.symbol)}
                              disabled={!!isReactivating}
                              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                            >
                              {isReactivating === stock.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {t('admin.stock.reactivating')}
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4" />
                                  {t('admin.stock.reactivate')}
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleClose}
          disabled={!!isReactivating}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {t('common.close')}
        </button>
      </div>
    </ModalContainer>
  );
};

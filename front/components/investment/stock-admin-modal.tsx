'use client';

import React, { useEffect } from 'react';
import { TrendingUp, Edit } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModalContainer } from '@/components/ui/modal-container';
import {
  createStockFormSchema,
  updateStockFormSchema,
  type CreateStockFormInput,
  type UpdateStockFormInput,
} from '@avenir/shared/schemas/stock.schema';

interface UpdateStockInitialData extends UpdateStockFormInput {
  isin?: string;
}

interface StockAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStockFormInput | UpdateStockFormInput) => Promise<void>;
  mode: 'create' | 'update';
  initialData?: UpdateStockInitialData;
  isLoading?: boolean;
}

export const StockAdminModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isLoading = false,
}: StockAdminModalProps) => {
  const { t } = useLanguage();

  const schema = mode === 'create' ? createStockFormSchema : updateStockFormSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateStockFormInput | UpdateStockFormInput>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      symbol: '',
      name: '',
      currentPrice: '',
      isActive: true,
    },
  });

  const onFormSubmit = async (data: CreateStockFormInput | UpdateStockFormInput) => {
    if (isLoading) return;

    const transformedData = {
      ...data,
      symbol: data.symbol?.toUpperCase(),
      currentPrice: data.currentPrice ? parseFloat(data.currentPrice as string) : undefined,
      marketCap: data.marketCap ? parseFloat(data.marketCap as string) : null,
      isActive: data.isActive ?? true,
    };

    await onSubmit(transformedData as any);
    handleClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && initialData) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? t('admin.stock.createTitle') : t('admin.stock.updateTitle')}
      description={mode === 'create' ? t('admin.stock.createDescription') : t('admin.stock.updateDescription')}
      disabled={isLoading}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {mode === 'update' && initialData && 'isin' in initialData && initialData.isin && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{t('admin.stock.isin')}</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{initialData.isin}</p>
              </div>
              <div className="text-xs text-gray-400">
                {t('admin.stock.generatedAutomatically')}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="symbol" className="mb-2 block text-sm font-medium text-gray-700">
              {t('admin.stock.symbol')} *
            </label>
            <input
              id="symbol"
              type="text"
              {...register('symbol')}
              placeholder="AAPL"
              disabled={isLoading || mode === 'update'}
              className={`w-full rounded-lg border ${
                errors.symbol ? 'border-red-500' : 'border-gray-300'
              } bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-50`}
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
              {t('admin.stock.name')} *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              placeholder="Apple Inc."
              disabled={isLoading}
              className={`w-full rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentPrice" className="mb-2 block text-sm font-medium text-gray-700">
              {mode === 'create' ? t('admin.stock.initialPrice') : t('admin.stock.currentPrice')} (€) *
            </label>
            <input
              id="currentPrice"
              type="number"
              step="0.01"
              {...register('currentPrice')}
              placeholder="150.00"
              disabled={isLoading || mode === 'update'}
              className={`w-full rounded-lg border ${
                errors.currentPrice ? 'border-red-500' : 'border-gray-300'
              } bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:bg-gray-50`}
            />
            {errors.currentPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPrice.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('admin.stock.isActive')}
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5">
              <input
                id="isActive"
                type="checkbox"
                {...register('isActive')}
                disabled={isLoading}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
                {t('admin.stock.active')}
              </label>
            </div>
          </div>
        </div>

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
            disabled={isLoading || !isValid}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('common.loading')}
              </>
            ) : (
              <>
                {mode === 'create' ? <TrendingUp className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {mode === 'create' ? t('admin.stock.create') : t('admin.stock.update')}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

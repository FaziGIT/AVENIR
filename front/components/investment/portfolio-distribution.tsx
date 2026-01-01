'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language';
import { EmptyState } from '@/components/investment/empty-state';

interface DistributionItem {
  symbol: string;
  percentage: number;
  amount: string;
  color: string;
}

interface PortfolioDistributionProps {
  title: string;
  items: DistributionItem[];
}

export const PortfolioDistribution = ({ title, items }: PortfolioDistributionProps) => {
  const { t } = useLanguage();

  const isEmpty = items.length === 0;

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!isEmpty && (
          <button className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
            {t('dashboard.investmentPage.viewAll')}
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState
          title={t('dashboard.investmentPage.emptyState.portfolioDistribution')}
          description={t('dashboard.investmentPage.emptyState.portfolioDistributionDescription')}
        />
      ) : (
        <>
          <div className="mb-4 flex h-4 w-full gap-1 rounded-full">
            {items.map((item, index) => (
              <motion.div
                key={item.symbol}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                style={{
                  backgroundColor: item.color,
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 6px,
                    rgba(255, 255, 255, 0.15) 6px,
                    rgba(255, 255, 255, 0.15) 8px
                  )`,
                }}
                className="h-full rounded-full"
              />
            ))}
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium text-gray-900">{item.symbol}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.amount}</span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

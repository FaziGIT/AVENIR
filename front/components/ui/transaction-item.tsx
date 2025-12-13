'use client';

import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionType = 'purchase' | 'receive' | 'send';

type TransactionItemProps = {
  name: string;
  time: string;
  cardNumber: string;
  category: string;
  amount: string;
  type: TransactionType;
  status: string;
  icon?: React.ReactNode;
  className?: string;
};

export const TransactionItem = ({
  name,
  time,
  cardNumber,
  category,
  amount,
  type,
  status,
  icon,
  className,
}: TransactionItemProps) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'success':
        return '#39a95d';
      case 'failed':
        return '#dc2626';
      case 'pending':
        return '#f59e0b';
      default:
        return '#39a95d';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex cursor-pointer flex-col gap-3 rounded-xl bg-gray-50 p-4 transition-all duration-200',
        'hover:bg-gray-100 md:flex-row md:items-center md:justify-between md:gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
            {icon || <Apple className="h-6 w-6 text-white" />}
          </div>

          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>

        <span className="text-lg font-bold financial-amount text-gray-900 md:hidden">{amount}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex min-w-[145px] items-center gap-2">
          <span className="w-[72px] text-center text-sm text-gray-600">{cardNumber}</span>
          <div className="flex h-[28px] w-[52px] items-center justify-center rounded-full border border-gray-200 bg-white">
            <span className="text-sm font-bold italic text-blue-700">VISA</span>
          </div>
        </div>

        <div className="min-w-[135px] rounded-full border border-gray-200 bg-white px-3 py-1.5 text-center">
          <span className="text-sm text-gray-600">{category}</span>
        </div>

        <div className="min-w-[110px] rounded-full px-3 py-1.5 text-center" style={{ backgroundColor: getStatusColor() }}>
          <span className="text-sm font-medium text-white">{status}</span>
        </div>

        <span className="hidden min-w-[120px] text-right text-lg font-bold financial-amount text-gray-900 md:inline">{amount}</span>
      </div>
    </motion.div>
  );
};

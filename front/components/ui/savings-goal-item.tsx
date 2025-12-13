'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SavingsGoalItemProps = {
  name: string;
  currentAmount: string;
  targetAmount: string;
  progress: number;
  variant?: 'blue' | 'yellow' | 'orange';
  className?: string;
};

const variantColors = {
  blue: {
    bg: 'rgba(104, 117, 249, 0.1)',
    text: '#6875f9',
    progress: '#6875f9',
    stripe: 'rgba(104, 117, 249, 0.3)',
  },
  yellow: {
    bg: 'rgba(172, 102, 251, 0.1)',
    text: '#ac66fb',
    progress: '#ac66fb',
    stripe: 'rgba(172, 102, 251, 0.3)',
  },
  orange: {
    bg: 'rgba(255, 123, 106, 0.1)',
    text: '#ff7b6a',
    progress: '#ff7b6a',
    stripe: 'rgba(255, 123, 106, 0.3)',
  },
};

export const SavingsGoalItem = ({
  name,
  currentAmount,
  targetAmount,
  progress,
  variant = 'blue',
  className,
}: SavingsGoalItemProps) => {
  const colors = variantColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-4 rounded-2xl border border-gray-200 bg-white p-5', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-gray-900">{name}</h4>
        <span className="text-xs font-medium financial-amount text-gray-600 sm:text-sm md:text-base">
          {currentAmount} / {targetAmount}
        </span>
      </div>

      <div className="relative h-8 overflow-hidden rounded-xl">
        <div className="flex h-full w-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative h-full rounded-l-xl flex items-center px-3"
            style={{ backgroundColor: colors.progress }}
          >
            <span className="text-sm font-bold text-white">{progress}%</span>
          </motion.div>
          <div
            className="h-full flex-1 rounded-r-xl"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 1.5px,
                ${colors.stripe} 1.5px,
                ${colors.stripe} 3px
              )`,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

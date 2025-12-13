'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
    title: string;
    amount: string;
    trend?: string;
    variant?: 'primary' | 'default';
    className?: string;
};

export const StatCard = ({ title, amount, trend, variant = 'default', className }: StatCardProps) => {
    const isPrimary = variant === 'primary';
    const isPositiveTrend = trend?.startsWith('+');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                isPrimary
                    ? 'text-white shadow-lg'
                    : 'bg-white border border-gray-100',
                className
            )}
            style={
                isPrimary
                    ? {
                        backgroundColor: '#383bfe',
                    }
                    : undefined
            }
        >
            <div className="mb-8 flex items-start justify-between">
                <span className={cn('text-sm font-medium', isPrimary ? 'text-white/90' : 'text-gray-600')}>
                    {title}
                </span>
                <button
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-1 bg-white transition-all hover:scale-110"
                    style={{ borderColor: '#585858' }}
                >
                    <ArrowUpRight className="h-5 w-5" style={{ color: '#585858' }} />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <h3 className={cn('text-4xl font-bold tracking-tight financial-amount', isPrimary ? 'text-white' : 'text-gray-900')}>
                    {amount}
                </h3>
                {trend && (
                    <div
                        className={cn(
                            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold',
                            isPrimary ? 'border-white/30 bg-white/20 text-white' : 'border-green-200 bg-green-50 text-green-600'
                        )}
                    >
                        {isPositiveTrend ? (
                            <ChevronUp className="h-4 w-4 stroke-[3]" />
                        ) : (
                            <ChevronDown className="h-4 w-4 stroke-[3]" />
                        )}
                        {trend}
                    </div>
                )}
            </div>

            {isPrimary && (
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            )}
        </motion.div>
    );
};

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface StockListItemProps {
    symbol: string;
    name: string;
    logo: string;
    price: string;
    change: string;
    isPositive: boolean;
    index: number;
    onClick?: () => void;
    quantity?: number;
    invested?: string;
}

export const StockListItem = ({
    symbol,
    name,
    logo,
    price,
    change,
    isPositive,
    index,
    onClick,
    quantity,
    invested,
}: StockListItemProps) => {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className={`flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    <Image src={logo} alt={symbol} width={40} height={40} className="h-full w-full object-cover" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{symbol}</p>
                    <p className="text-xs text-gray-500">{name}</p>
                    {quantity !== undefined && (
                        <p className="text-xs text-gray-400">{quantity.toFixed(2)} {t('dashboard.investmentPage.shares')}</p>
                    )}
                    {invested && (
                        <p className="text-xs font-medium text-gray-400">{t('dashboard.investmentPage.invested')}: {invested}</p>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{price}</p>
                <p className={`flex items-center justify-end gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {change.replace(/^[+-]/, '')}
                </p>
            </div>
        </motion.div>
    );
};

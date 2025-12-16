'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

type CreditCardProps = {
    cardNumber: string;
    expiryDate?: string;
    cardType?: string;
    className?: string;
};

export const CreditCard = ({ cardNumber, expiryDate = '09/28', cardType = 'VISA', className }: CreditCardProps) => {
    const isMastercard = cardType === 'Mastercard';
    const cardBackground = isMastercard
        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
        : 'linear-gradient(135deg, #e8e9f3 0%, #d8d9e8 100%)';
    const textColor = isMastercard ? 'text-white' : 'text-[#1a1f71]';
    const iconColor = isMastercard ? 'text-white/80' : 'text-gray-600';
    const numberColor = isMastercard ? 'text-white' : 'text-gray-900';
    const expiryBgColor = isMastercard ? 'rgba(255, 255, 255, 0.2)' : '#eef1f7';
    const expiryTextColor = isMastercard ? 'text-white' : 'text-gray-900';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={cn('relative overflow-hidden rounded-2xl p-6', className)}
            style={{
                background: cardBackground
            }}
        >
            <div className="mb-12 flex items-start justify-between">
                <div className={cn('text-3xl font-black', isMastercard ? 'font-bold' : 'italic', textColor)}>
                    {cardType}
                </div>
                <Wifi className={cn('h-6 w-6 rotate-90', iconColor)} />
            </div>

            <div className="mb-2">
                <Image src="/chip.png" alt="EMV Chip" width={45} height={34} />
            </div>

            <div className="flex items-end justify-between">
                <p className={cn('text-2xl font-bold tracking-wider', numberColor)}>{cardNumber}</p>
                <div className="rounded-full px-3 py-1.5" style={{ backgroundColor: expiryBgColor }}>
                    <p className={cn('text-base font-semibold', expiryTextColor)}>{expiryDate}</p>
                </div>
            </div>
        </motion.div>
    );
};

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Stock } from './types';

interface StockTickerProps {
  stocks: Stock[];
  onStockClick?: (stock: Stock) => void;
}

export const StockTicker = ({ stocks, onStockClick }: StockTickerProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedStocks = stocks;

  const animationDuration = 30;

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-4 pb-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          animation: `scroll ${animationDuration}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedStocks.map((stock, index) => (
          <motion.div
            key={`${stock.symbol}-${index}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % stocks.length) * 0.05 }}
            onClick={() => onStockClick?.(stock)}
            className="flex min-w-[140px] shrink-0 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              <Image
                src={stock.logo}
                alt={stock.symbol}
                width={24}
                height={24}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-900">{stock.symbol}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{stock.price}</span>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stock.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                  {stock.change.replace('+', '').replace('-', '')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

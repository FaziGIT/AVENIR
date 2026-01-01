'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface MarketInsightItemProps {
  title: string;
  description: string;
  image: string;
  index: number;
}

export const MarketInsightItem = ({ title, description, image, index }: MarketInsightItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
    >
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={image} alt={title} width={64} height={64} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <h4 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-900">{title}</h4>
        <p className="line-clamp-2 text-xs text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
};

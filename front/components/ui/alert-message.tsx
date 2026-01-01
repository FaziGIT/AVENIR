'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AlertMessageProps {
  type: 'success' | 'error';
  message: string;
}

export const AlertMessage = ({ type, message }: AlertMessageProps) => {
  const styles = {
    success: 'border-green-300 bg-green-50 text-green-800',
    error: 'border-red-300 bg-red-50 text-red-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-4 ${styles[type]}`}
    >
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

'use client';

import '@/i18n/config';
import { Home, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { ErrorPageHeader } from '@/components/error-page-header';
import { Error500Cables } from '@/components/error-500-cables';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const { t } = useLanguage();

    return (
        <div className="h-screen overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
            <ErrorPageHeader />

            <main className="mx-auto flex h-[calc(100vh-73px)] max-w-[1400px] items-center justify-center overflow-y-auto p-6">
                <div className="w-full text-center">
                    {/* Title and description at top */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-3 text-sm font-semibold uppercase tracking-wide text-red-500"
                        >
                            {t('errors.500.errorCode')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-5 text-4xl font-bold text-gray-900 md:text-5xl"
                        >
                            {t('errors.500.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mb-3 text-lg font-medium text-gray-700 md:text-xl"
                        >
                            {t('errors.500.subtitle')}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mx-auto max-w-xl text-base text-gray-600"
                        >
                            {t('errors.500.description')}
                        </motion.p>
                    </motion.div>

                    {/* Cables visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto mb-28 mt-18 max-w-2xl"
                    >
                        <Error500Cables />
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <button
                            onClick={() => reset()}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-gray-800"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t('errors.500.tryAgain')}
                        </button>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-all hover:scale-105 hover:bg-gray-50"
                        >
                            <Home className="h-4 w-4" />
                            {t('errors.500.goHome')}
                        </Link>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

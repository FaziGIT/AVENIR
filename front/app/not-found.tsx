'use client';

import '@/i18n/config';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { ErrorPageHeader } from '@/components/error-page-header';
import { Error404Graph } from '@/components/error-404-graph';

export default function NotFound() {
    const { t } = useLanguage();

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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
                            className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500"
                        >
                            {t('errors.404.errorCode')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-5 text-4xl font-bold text-gray-900 md:text-5xl"
                        >
                            {t('errors.404.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mb-3 text-lg font-medium text-gray-700 md:text-xl"
                        >
                            {t('errors.404.subtitle')}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mx-auto max-w-xl text-base text-gray-600"
                        >
                            {t('errors.404.description')}
                        </motion.p>
                    </motion.div>

                    {/* Graph visualization */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto mb-12 max-w-2xl"
                    >
                        <Error404Graph />
                    </motion.div>

                    {/* Action buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-all hover:scale-105 hover:bg-gray-800"
                        >
                            <Home className="h-4 w-4" />
                            {t('errors.404.goHome')}
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-all hover:scale-105 hover:bg-gray-50"
                        >
                            {t('common.back')}
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

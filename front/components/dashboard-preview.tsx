'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useLanguage } from '@/hooks/use-language';

export const DashboardPreview = () => {
    const { t } = useLanguage();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const stats = [
        { title: t('dashboard.income'), amount: 41200, trend: '+2.5%' },
        { title: t('dashboard.expenses'), amount: 23200, trend: '+1.8%' },
        { title: t('dashboard.savings'), amount: 9800, trend: '+3.2%' },
    ];

    const transactions = [
        { name: 'iPhone 17', time: '11:37 AM', cardNumber: '****4329', amount: 1020.00 },
        { name: 'Starbucks Coffee', time: '09:15 AM', cardNumber: '****4329', amount: 12.50 },
        { name: 'Uber Ride', time: '08:30 AM', cardNumber: '****8765', amount: 25.00 },
    ];

    const savingsGoals = [
        { name: 'Livret A', current: 15420, target: 22950, progress: 67, variant: 'blue' as const },
        { name: 'Livret Jeune', current: 1280, target: 1600, progress: 80, variant: 'yellow' as const },
    ];

    const variantColors = {
        blue: {
            bg: 'rgba(59, 130, 246, 0.1)',
            text: '#3b82f6',
            progress: '#3b82f6',
            stripe: 'rgba(59, 130, 246, 0.3)',
        },
        yellow: {
            bg: 'rgba(172, 102, 251, 0.1)',
            text: '#ac66fb',
            progress: '#ac66fb',
            stripe: 'rgba(172, 102, 251, 0.3)',
        },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                rotateX: 45,
                y: 100,
                scale: 0.9,
            }}
            animate={{
                opacity: 1,
                rotateX: 0,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
            }}
            className="relative mx-auto w-full max-w-[1400px]"
            style={{
                perspective: '2000px',
                transformStyle: 'preserve-3d',
            }}
        >
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-2xl">
                {/* Dashboard Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex items-center justify-between border-b bg-white/80 px-6 py-4 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-2">
                        <Image src="/avenir.png" alt="AVENIR" width={80} height={80} className="h-10 w-auto" />
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                        <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
                            {[
                                { id: 'overview', label: t('dashboard.overview') },
                                { id: 'investment', label: t('dashboard.investment') },
                                { id: 'card', label: t('dashboard.card') },
                                { id: 'activity', label: t('dashboard.activity') },
                                { id: 'saving', label: t('dashboard.saving') }
                            ].map((item, i) => {
                                const displayTab = hoveredTab || activeTab;
                                const shouldShowBackground = displayTab === item.id;

                                return (
                                    <motion.button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        onMouseEnter={() => setHoveredTab(item.id)}
                                        onMouseLeave={() => setHoveredTab(null)}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + i * 0.05, duration: 0.3 }}
                                        className={`relative z-10 rounded-full px-4 py-2 text-xs font-medium transition-colors duration-200 ${
                                            shouldShowBackground ? 'text-white' : 'text-gray-600'
                                        }`}
                                    >
                                        {shouldShowBackground && (
                                            <motion.div
                                                layoutId="dashboardNavBackground"
                                                className="absolute inset-0 rounded-full bg-gray-900"
                                                style={{ zIndex: -1 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                        {item.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Dashboard Content */}
                <div className="bg-gray-50 p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Left Column */}
                        <div className="space-y-6 lg:col-span-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                                        className="cursor-pointer rounded-xl border bg-white p-4 shadow-sm"
                                    >
                                        <motion.p
                                            className="mb-2 text-xs font-medium text-gray-500"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.9 + i * 0.1 }}
                                        >
                                            {stat.title}
                                        </motion.p>
                                        <motion.h3
                                            className="mb-1 text-xl font-bold text-gray-900"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                                        >
                                            $<AnimatedNumber value={stat.amount} />
                                        </motion.h3>
                                        <motion.p
                                            className="flex items-center gap-1 text-xs font-medium text-green-600"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.1 + i * 0.1 }}
                                        >
                                            <span>↑</span>
                                            {stat.trend}
                                        </motion.p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Chart Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.6 }}
                                className="rounded-xl border bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <motion.p
                                            className="mb-2 text-xs font-medium text-gray-500"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                        >
                                            {t('dashboard.totalBalance')}
                                        </motion.p>
                                        <motion.h2
                                            className="text-2xl font-bold text-gray-900 md:text-3xl"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.3, type: 'spring', stiffness: 100 }}
                                        >
                                            $<AnimatedNumber value={102489} decimals={2} />
                                        </motion.h2>
                                    </div>
                                    <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-900">
                                        {t('dashboard.yearly')}
                                    </div>
                                </div>
                                <motion.h3
                                    className="mb-4 text-sm font-semibold text-gray-900"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.4 }}
                                >
                                    {t('dashboard.spending')}
                                </motion.h3>
                                {/* Simple Bar Chart */}
                                <div className="flex items-end justify-between gap-2" style={{ height: '180px' }}>
                                    {[40, 60, 30, 20, 45, 85, 40, 65, 90, 55, 35, 25].map((height, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ delay: 1.2 + i * 0.05, duration: 0.4, type: 'spring' }}
                                            className="flex-1 origin-bottom cursor-pointer rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400"
                                            style={{ height: `${height}%` }}
                                        ></motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Transactions Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3, duration: 0.6 }}
                                className="rounded-xl border bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <motion.h3
                                        className="text-lg font-semibold text-gray-900"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.5 }}
                                    >
                                        {t('dashboard.recentTransactions')}
                                    </motion.h3>
                                </div>
                                <div className="space-y-3">
                                    {transactions.map((transaction, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                                            className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                    <ArrowUp className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <motion.p
                                                        className="text-sm font-medium text-gray-900"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 1.6 + i * 0.1 }}
                                                    >
                                                        {transaction.name}
                                                    </motion.p>
                                                    <motion.p
                                                        className="text-xs text-gray-500"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 1.65 + i * 0.1 }}
                                                    >
                                                        {transaction.time} • {transaction.cardNumber}
                                                    </motion.p>
                                                </div>
                                            </div>
                                            <motion.p
                                                className="text-sm font-semibold text-gray-900"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 1.7 + i * 0.1, type: 'spring' }}
                                            >
                                                $<AnimatedNumber value={transaction.amount} decimals={2} />
                                            </motion.p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 lg:col-span-4">
                            {/* Cards Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9, duration: 0.6 }}
                                className="rounded-xl border bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <motion.h3
                                        className="text-lg font-semibold text-gray-900"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.1 }}
                                    >
                                        {t('dashboard.myCards')}
                                    </motion.h3>
                                    <div className="flex cursor-pointer items-center gap-1 rounded-full bg-gray-100 px-3 py-2">
                                        <Plus className="h-4 w-4 text-gray-700" />
                                        <span className="text-xs font-medium text-gray-900">{t('dashboard.addCard')}</span>
                                    </div>
                                </div>
                                <motion.div
                                    initial={{ rotateY: -15, scale: 0.95 }}
                                    animate={{ rotateY: 0, scale: 1 }}
                                    transition={{ delay: 1.1, duration: 0.6 }}
                                    className="mb-4 cursor-pointer rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-6 shadow-lg"
                                    style={{ aspectRatio: '1.586' }}
                                >
                                    <div className="flex h-full flex-col justify-between">
                                        <div className="text-sm font-semibold text-white/80">
                                            VISA
                                        </div>
                                        <div>
                                            <motion.p
                                                className="mb-2 font-mono text-lg font-semibold tracking-wider text-white"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.3 }}
                                            >
                                                •••• •••• •••• 4329
                                            </motion.p>
                                            <motion.p
                                                className="text-xs text-white/60"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1.4 }}
                                            >
                                                09/28
                                            </motion.p>
                                        </div>
                                    </div>
                                </motion.div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex cursor-pointer items-center justify-center gap-2 rounded-full border bg-white px-4 py-3">
                                        <ArrowDown className="h-4 w-4 text-gray-700" />
                                        <span className="text-xs font-medium text-gray-900">{t('dashboard.receiveFunds')}</span>
                                    </div>
                                    <div className="flex cursor-pointer items-center justify-center gap-2 rounded-full border bg-white px-4 py-3">
                                        <ArrowUp className="h-4 w-4 text-gray-700" />
                                        <span className="text-xs font-medium text-gray-900">{t('dashboard.sendMoney')}</span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <motion.div
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.5 }}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                                            <ArrowUp className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-gray-700">{t('dashboard.incomeThisMonth')}</span>
                                        <motion.span
                                            className="text-base font-semibold text-gray-900"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.6, type: 'spring' }}
                                        >
                                            $<AnimatedNumber value={2873} decimals={2} />
                                        </motion.span>
                                    </motion.div>
                                    <motion.div
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.6 }}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                                            <ArrowDown className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-gray-700">{t('dashboard.expensesThisMonth')}</span>
                                        <motion.span
                                            className="text-base font-semibold text-gray-900"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.7, type: 'spring' }}
                                        >
                                            $<AnimatedNumber value={1924} decimals={2} />
                                        </motion.span>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Savings Goals Section */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.6 }}
                                className="rounded-xl border bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <motion.h3
                                        className="text-lg font-semibold text-gray-900"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4 }}
                                    >
                                        {t('dashboard.savingsGoals')}
                                    </motion.h3>
                                    <button className="cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-900">
                                        {t('dashboard.viewAll')}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {savingsGoals.map((goal, i) => {
                                        const colors = variantColors[goal.variant];
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 1.4 + i * 0.1, duration: 0.4 }}
                                                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4"
                                            >
                                                <div className="mb-4 flex items-center justify-between gap-2">
                                                    <motion.h4
                                                        className="text-sm font-semibold text-gray-900"
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 1.5 + i * 0.1 }}
                                                    >
                                                        {goal.name}
                                                    </motion.h4>
                                                    <motion.span
                                                        className="text-xs font-medium text-gray-600"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 1.55 + i * 0.1, type: 'spring' }}
                                                    >
                                                        <AnimatedNumber value={goal.current} delay={i * 0.1} /> € / <AnimatedNumber value={goal.target} delay={i * 0.1} /> €
                                                    </motion.span>
                                                </div>

                                                <div className="relative h-8 overflow-hidden rounded-xl">
                                                    <div className="flex h-full w-full">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${goal.progress}%` }}
                                                            transition={{ delay: 1.6 + i * 0.1, duration: 1.2, ease: 'easeOut' }}
                                                            className="relative flex h-full items-center rounded-l-xl px-3"
                                                            style={{ backgroundColor: colors.progress }}
                                                        >
                                                            <motion.span
                                                                className="text-sm font-bold text-white"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 1.8 + i * 0.1 }}
                                                            >
                                                                <AnimatedNumber value={goal.progress} delay={i * 0.1} />%
                                                            </motion.span>
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
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

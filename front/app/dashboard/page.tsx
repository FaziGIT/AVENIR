'use client';

import '@/i18n/config';
import { StatCard } from '@/components/ui/stat-card';
import { TransactionItem } from '@/components/ui/transaction-item';
import { CreditCard } from '@/components/ui/credit-card';
import { SavingsGoalItem } from '@/components/ui/savings-goal-item';
import { BarChart } from '@/components/ui/bar-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard-header';
import { Search, ArrowUp, ArrowDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';

export default function Home() {
    const { t } = useLanguage();
    const [period, setPeriod] = useState('yearly');
    const [activeTab, setActiveTab] = useState('overview');
    const [filterOpen, setFilterOpen] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [cardDirection, setCardDirection] = useState(1);
    const [activeFilters, setActiveFilters] = useState<{
        card: string | null;
        category: string | null;
        status: string | null;
    }>({
        card: null,
        category: null,
        status: null,
    });
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };

        if (filterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterOpen]);

    const cards = [
        { cardNumber: '****4329', cardType: 'VISA', expiryDate: '09/28' },
        { cardNumber: '****8765', cardType: 'Mastercard', expiryDate: '12/26' },
    ];

    const nextCard = () => {
        setCardDirection(1);
        setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    };

    const prevCard = () => {
        setCardDirection(-1);
        setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const getChartData = () => {
        if (period === 'monthly') {
            return [
                { label: 'Week 1', value: 15, percentage: '+12%' },
                { label: 'Week 2', value: 20, percentage: '+18%' },
                { label: 'Week 3', value: 18, percentage: '+15%' },
                { label: 'Week 4', value: 25, percentage: '+22%' },
            ];
        } else if (period === 'weekly') {
            return [
                { label: 'Mon', value: 5, percentage: '+8%' },
                { label: 'Tue', value: 8, percentage: '+12%' },
                { label: 'Wed', value: 6, percentage: '+10%' },
                { label: 'Thu', value: 10, percentage: '+15%' },
                { label: 'Fri', value: 7, percentage: '+11%' },
                { label: 'Sat', value: 4, percentage: '+7%' },
                { label: 'Sun', value: 3, percentage: '+5%' },
            ];
        }
        return [
            { label: 'Jan', value: 25, percentage: '+16%' },
            { label: 'Feb', value: 35, percentage: '+21%' },
            { label: 'Mar', value: 15, percentage: '+36%' },
            { label: 'Apr', value: 10, percentage: '+19%' },
            { label: 'May', value: 25, percentage: '+25%' },
            { label: 'Jun', value: 59.8, percentage: '+14%' },
            { label: 'Jul', value: 25, percentage: '+8%' },
            { label: 'Aug', value: 45, percentage: '+11%' },
            { label: 'Sep', value: 60, percentage: '+9%' },
            { label: 'Oct', value: 35, percentage: '+20%' },
            { label: 'Nov', value: 15, percentage: '+7%' },
            { label: 'Dec', value: 10, percentage: '+4%' },
        ];
    };

    const chartData = getChartData();

    const allTransactions = [
        { id: 1, name: 'iPhone 17', time: '11:37 AM', cardNumber: '****4329', cardType: 'VISA', category: t('dashboard.electronics'), amount: '$1,020.00', type: 'purchase' as const, status: 'Success', date: 'Today', dateGroup: 'today' },
        { id: 2, name: 'Starbucks Coffee', time: '09:15 AM', cardNumber: '****4329', cardType: 'VISA', category: 'Food & Drink', amount: '$12.50', type: 'purchase' as const, status: 'Success', date: 'Today', dateGroup: 'today' },
        { id: 3, name: 'Uber Ride', time: '08:30 AM', cardNumber: '****8765', cardType: 'Mastercard', category: 'Transport', amount: '$25.00', type: 'purchase' as const, status: 'Success', date: 'Today', dateGroup: 'today' },
        { id: 4, name: 'Netflix Subscription', time: '10:00 AM', cardNumber: '****4329', cardType: 'VISA', category: 'Entertainment', amount: '$15.99', type: 'purchase' as const, status: 'Success', date: 'Dec 10, 2024', dateGroup: 'lastWeek' },
        { id: 5, name: 'Amazon Purchase', time: '02:30 PM', cardNumber: '****8765', cardType: 'Mastercard', category: t('dashboard.electronics'), amount: '$89.99', type: 'purchase' as const, status: 'Success', date: 'Dec 9, 2024', dateGroup: 'lastWeek' },
        { id: 6, name: 'Grocery Shopping', time: '05:45 PM', cardNumber: '****4329', cardType: 'VISA', category: 'Food & Drink', amount: '$156.30', type: 'purchase' as const, status: 'Pending', date: 'Dec 8, 2024', dateGroup: 'lastWeek' },
        { id: 7, name: 'Gym Membership', time: '09:00 AM', cardNumber: '****8765', cardType: 'Mastercard', category: 'Health', amount: '$49.99', type: 'purchase' as const, status: 'Success', date: 'Nov 28, 2024', dateGroup: 'lastMonth' },
        { id: 8, name: 'Book Purchase', time: '03:20 PM', cardNumber: '****4329', cardType: 'VISA', category: 'Shopping', amount: '$34.50', type: 'purchase' as const, status: 'Success', date: 'Nov 25, 2024', dateGroup: 'lastMonth' },
        { id: 9, name: 'Restaurant Dinner', time: '07:30 PM', cardNumber: '****8765', cardType: 'Mastercard', category: 'Food & Drink', amount: '$78.90', type: 'purchase' as const, status: 'Failed', date: 'Nov 22, 2024', dateGroup: 'lastMonth' },
    ];

    const filteredTransactions = allTransactions.filter((transaction) => {
        if (activeFilters.card && transaction.cardType !== activeFilters.card) return false;
        if (activeFilters.category && transaction.category !== activeFilters.category) return false;
        if (activeFilters.status && transaction.status !== activeFilters.status) return false;
        return true;
    });

    const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
        const group = transaction.dateGroup;
        if (!acc[group]) acc[group] = [];
        acc[group].push(transaction);
        return acc;
    }, {} as Record<string, typeof allTransactions>);

    const clearFilters = () => {
        setActiveFilters({ card: null, category: null, status: null });
    };

    const hasActiveFilters = activeFilters.card || activeFilters.category || activeFilters.status;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="mx-auto max-w-[1800px] p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <StatCard title={t('dashboard.income')} amount="$41,200" trend="+2.5%" variant="primary" />
                            <StatCard title={t('dashboard.expenses')} amount="$23,200" trend="+1.8%" />
                            <StatCard title={t('dashboard.savings')} amount="$9,800" trend="+3.2%" />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border bg-white p-6"
                        >
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500">{t('dashboard.totalBalance')}</p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight financial-amount text-gray-900 sm:text-3xl md:text-4xl">$102,489.00</h2>
                                </div>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="h-9 w-[115px] text-xs sm:h-10 sm:w-[140px] sm:text-sm">
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="mb-2">
                                <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('dashboard.spending')}</h3>
                                <div className={period === 'yearly' ? 'overflow-x-auto md:overflow-x-visible' : ''}>
                                    <div className={period === 'yearly' ? 'min-w-[600px] md:min-w-0' : ''}>
                                        <BarChart
                                            key={period}
                                            data={chartData}
                                            highlightIndex={period === 'yearly' ? 5 : period === 'monthly' ? 3 : 3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border bg-white p-4 md:p-6"
                        >
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">{t('dashboard.recentTransactions')}</h3>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="flex flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm sm:px-6 sm:py-3">
                                        <Search className="h-5 w-5 shrink-0 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder={t('common.search') + '...'}
                                            className="w-full border-none bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none sm:w-64"
                                        />
                                    </div>
                                    <div className="relative" ref={filterRef}>
                                        <button
                                            onClick={() => setFilterOpen(!filterOpen)}
                                            className="cursor-pointer rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 sm:py-3"
                                        >
                                            {t('common.filter')} {hasActiveFilters && `(${Object.values(activeFilters).filter(Boolean).length})`}
                                        </button>
                                        {filterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
                                            >
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-gray-900">Filters</h4>
                                                    {hasActiveFilters && (
                                                        <button
                                                            onClick={clearFilters}
                                                            className="cursor-pointer text-xs text-blue-600 hover:text-blue-700"
                                                        >
                                                            Clear all
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-700">Card</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => setActiveFilters({ ...activeFilters, card: activeFilters.card === 'VISA' ? null : 'VISA' })}
                                                                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeFilters.card === 'VISA'
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                VISA
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveFilters({ ...activeFilters, card: activeFilters.card === 'Mastercard' ? null : 'Mastercard' })}
                                                                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeFilters.card === 'Mastercard'
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    }`}
                                                            >
                                                                Mastercard
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-700">Category</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {[t('dashboard.electronics'), 'Food & Drink', 'Transport', 'Entertainment', 'Health', 'Shopping'].map((cat) => (
                                                                <button
                                                                    key={cat}
                                                                    onClick={() => setActiveFilters({ ...activeFilters, category: activeFilters.category === cat ? null : cat })}
                                                                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeFilters.category === cat
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-gray-700">Status</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Success', 'Pending', 'Failed'].map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => setActiveFilters({ ...activeFilters, status: activeFilters.status === status ? null : status })}
                                                                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeFilters.status === status
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(groupedTransactions).map(([group, transactions]) => (
                                    <div key={group} className="space-y-4">
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                {group === 'today' ? 'Today' : group === 'lastWeek' ? 'Last Week' : 'Last Month'}
                                            </span>
                                            <span className="text-sm text-gray-500">{transactions.length} {t('dashboard.transactions')}</span>
                                        </div>

                                        {transactions.map((transaction) => (
                                            <TransactionItem
                                                key={transaction.id}
                                                name={transaction.name}
                                                time={transaction.time}
                                                cardNumber={transaction.cardNumber}
                                                category={transaction.category}
                                                amount={transaction.amount}
                                                type={transaction.type}
                                                status={transaction.status}
                                            />
                                        ))}
                                    </div>
                                ))}

                                {filteredTransactions.length === 0 && (
                                    <div className="py-12 text-center text-gray-500">
                                        No transactions found with the selected filters.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-6 lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-2xl border bg-white p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">{t('dashboard.myCards')}</h3>
                                <button className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-200">
                                    <Plus className="h-4 w-4" />
                                    {t('dashboard.addCard')}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    {cards.length > 1 && (
                                        <button
                                            onClick={prevCard}
                                            className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 hover:scale-110 md:flex"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                                        </button>
                                    )}

                                    <motion.div
                                        key={currentCardIndex}
                                        initial={{ opacity: 0, x: 100 * cardDirection }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 * cardDirection }}
                                        transition={{ duration: 0.3 }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.2}
                                        onDragEnd={(_, { offset, velocity }) => {
                                            const swipe = Math.abs(offset.x) * velocity.x;

                                            if (swipe < -10000) {
                                                nextCard();
                                            } else if (swipe > 10000) {
                                                prevCard();
                                            }
                                        }}
                                        className="flex-1 cursor-grab active:cursor-grabbing"
                                    >
                                        <CreditCard
                                            cardNumber={cards[currentCardIndex].cardNumber}
                                            cardType={cards[currentCardIndex].cardType}
                                            expiryDate={cards[currentCardIndex].expiryDate}
                                        />
                                    </motion.div>

                                    {cards.length > 1 && (
                                        <button
                                            onClick={nextCard}
                                            className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 hover:scale-110 md:flex"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-700" />
                                        </button>
                                    )}
                                </div>

                                {cards.length > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        {cards.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentCardIndex(index)}
                                                className={`h-2 cursor-pointer rounded-full transition-all ${index === currentCardIndex ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 transition-all hover:bg-gray-50">
                                    <ArrowDown className="h-5 w-5 text-gray-700" />
                                    <span className="text-base font-medium text-gray-900">{t('dashboard.receiveFunds')}</span>
                                </button>
                                <button className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 transition-all hover:bg-gray-50">
                                    <ArrowUp className="h-5 w-5 text-gray-700" />
                                    <span className="text-base font-medium text-gray-900">{t('dashboard.sendMoney')}</span>
                                </button>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                                        <ArrowUp className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="flex-1 text-base font-medium text-gray-700">{t('dashboard.incomeThisMonth')}</span>
                                    <span className="text-lg font-semibold financial-amount text-gray-900">$2,873.00</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border">
                                        <ArrowDown className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="flex-1 text-base font-medium text-gray-700">{t('dashboard.expensesThisMonth')}</span>
                                    <span className="text-lg font-semibold financial-amount text-gray-900">$1,924.00</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl border bg-white p-6"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">{t('dashboard.savingsGoals')}</h3>
                                <button className="cursor-pointer rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-200">
                                    {t('dashboard.viewAll')}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <SavingsGoalItem
                                    name={t('dashboard.livretA')}
                                    currentAmount="15 420,00 €"
                                    targetAmount={`22 950,00 € (${t('dashboard.plafond')})`}
                                    progress={67}
                                    variant="blue"
                                />
                                <SavingsGoalItem
                                    name={t('dashboard.livretJeune')}
                                    currentAmount="1 280,00 €"
                                    targetAmount={`1 600,00 € (${t('dashboard.plafond')})`}
                                    progress={80}
                                    variant="yellow"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}


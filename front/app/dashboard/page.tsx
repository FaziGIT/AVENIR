'use client';

import '@/i18n/config';
import { StatCard } from '@/components/ui/stat-card';
import { TransactionItem } from '@/components/ui/transaction-item';
import { CreditCard } from '@/components/ui/credit-card';
import { SavingsGoalItem } from '@/components/ui/savings-goal-item';
import { NewsCard } from '@/components/news/news-card';
import { BarChart } from '@/components/ui/bar-chart';
import { FilterToggleButton } from '@/components/ui/filter-toggle-button';
import { ActionButton } from '@/components/ui/action-button';
import { StatRow } from '@/components/ui/stat-row';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardHeader } from '@/components/dashboard-header';
import { AddAccountModal } from '@/components/modals/AddAccountModal';
import { AddSavingsModal } from '@/components/modals/AddSavingsModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { DeleteAccountModal as DeleteUserAccountModal } from '@/components/modals/delete-account-modal';
import { EditAccountNameModal } from '@/components/modals/EditAccountNameModal';
import { SendMoneyModal } from '@/components/modals/SendMoneyModal';
import { News } from '@/types/news';
import { getAllNews } from '@/lib/api/news.api';
import { AddMoneyModal } from '@/components/modals/AddMoneyModal';
import { Search, ArrowUp, ArrowDown, Plus, ChevronLeft, ChevronRight, Trash2, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { accountApi, Account } from '@/lib/api/account.api';
import { transactionApi, Transaction } from '@/lib/api/transaction.api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AccountType, TransactionType } from '@/types/enums';
import { formatCurrency } from '@/lib/format';
import { calculateSavingsProgress } from '@/lib/savings';
import { useSSE, SSEEventType, isNewsCreatedPayload, isNewsDeletedPayload } from '@/contexts/SSEContext';
import { mapSSENewsToNews } from '@/lib/mapping/sse.mapping';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { RealTransactionItem } from '@/components/ui/real-transaction-item';

export default function Home() {
    const { t } = useLanguage();
    const { user, isLoading: isAuthLoading, logout } = useAuth();
    const { toast } = useToast();
    const { subscribe } = useSSE();
    const router = useRouter();
    const [period, setPeriod] = useState('yearly');
    const [activeTab, setActiveTab] = useState('overview');
    const [filterOpen, setFilterOpen] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [cardDirection, setCardDirection] = useState(1);
    const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
    const [addSavingsModalOpen, setAddSavingsModalOpen] = useState(false);
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [deleteUserAccountModalOpen, setDeleteUserAccountModalOpen] = useState(false);
    const [deleteAccountType, setDeleteAccountType] = useState<AccountType | undefined>(undefined);
    const [editAccountNameModalOpen, setEditAccountNameModalOpen] = useState(false);
    const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
    const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<Account | null>(null);
    const [news, setNews] = useState<News[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        category: string | null;
    }>({
        category: null,
    });
    const filterRef = useRef<HTMLDivElement>(null);
    const transactionsRef = useRef<HTMLDivElement>(null);

    const loadAccounts = useCallback(async () => {
        if (!user?.id) {
            setIsLoadingAccounts(false);
            return;
        }

        try {
            setIsLoadingAccounts(true);
            const loadedAccounts = await accountApi.getAccounts();
            setAccounts(loadedAccounts);
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast({
                title: t('common.error'),
                description: 'Erreur lors du chargement des comptes',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingAccounts(false);
        }
    }, [user?.id, toast, t]);

    const loadTransactions = useCallback(async () => {
        if (!user?.id) {
            setIsLoadingTransactions(false);
            return;
        }

        try {
            setIsLoadingTransactions(true);
            const loadedTransactions = await transactionApi.getTransactions();
            setTransactions(loadedTransactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setIsLoadingTransactions(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            loadAccounts();
            loadTransactions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    useEffect(() => {
        const loadNews = async () => {
            if (!user) return;

            try {
                setIsLoadingNews(true);
                const newsData = await getAllNews();
                setNews(newsData);
            } catch (error) {
                console.error('Error loading news:', error);
            } finally {
                setIsLoadingNews(false);
            }
        };

        loadNews();
    }, [user]);

    useEffect(() => {
        const unsubscribe = subscribe((event) => {
            if (event.type === SSEEventType.NEWS_CREATED && isNewsCreatedPayload(event.data)) {
                const newNews = mapSSENewsToNews(event.data);
                setNews((prev) => [newNews, ...prev]);
            }
            else if (event.type === SSEEventType.NEWS_DELETED && isNewsDeletedPayload(event.data)) {
                const deletedNewsId = event.data.newsId;
                setNews((prev) => prev.filter((n) => n.id !== deletedNewsId));
            }
        });

        return () => unsubscribe();
    }, [subscribe]);

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

    const cards = accounts
        .filter((account) => account.type === AccountType.CURRENT)
        .map((account) => ({
        id: account.id,
        cardNumber: account.cardNumber ? `****${account.cardNumber.slice(-4)}` : '****0000',
        cardType: account.cardNumber ? 'VISA' : 'N/A',
        expiryDate: account.cardExpiryDate || '00/00',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        accountName: account.name || account.iban,
        cvv: '***',
        account: account,
    }));

    const nextCard = () => {
        setCardDirection(1);
        setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    };

    const prevCard = () => {
        setCardDirection(-1);
        setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    // Calculate real data from accounts and transactions
    const userAccountIds = new Set(accounts.map(acc => acc.id));
    const totalBalance = accounts.reduce((sum, account) => {
        // Convert to same currency (assuming EUR for now, or use account currency)
        return sum + account.balance;
    }, 0);

    const savingsTotal = accounts
        .filter(acc => acc.type === AccountType.SAVINGS)
        .reduce((sum, account) => sum + account.balance, 0);

    const savingsAccountIds = new Set(
        accounts.filter(acc => acc.type === AccountType.SAVINGS).map(acc => acc.id)
    );

    // Calculate income (DEPOSIT transactions)
    const income = transactions
        .filter(t => t.type === TransactionType.DEPOSIT)
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate expenses (TRANSFER out to external accounts - not to user's own accounts)
    const expenses = transactions
        .filter(t => {
            if (t.type === TransactionType.TRANSFER) {
                // It's an expense if it's a transfer FROM a user account TO an external account
                const isFromUserAccount = userAccountIds.has(t.fromAccountId);
                const isToUserAccount = userAccountIds.has(t.toAccountId);
                return isFromUserAccount && !isToUserAccount;
            }
            return false;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate this month's income and expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startOfMonth;
    });

    const incomeThisMonth = thisMonthTransactions
        .filter(t => t.type === TransactionType.DEPOSIT)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensesThisMonth = thisMonthTransactions
        .filter(t => {
            if (t.type === TransactionType.TRANSFER) {
                const isFromUserAccount = userAccountIds.has(t.fromAccountId);
                const isToUserAccount = userAccountIds.has(t.toAccountId);
                return isFromUserAccount && !isToUserAccount;
            }
            return false;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
    });

    const incomeLastMonth = lastMonthTransactions
        .filter(t => t.type === TransactionType.DEPOSIT)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensesLastMonth = lastMonthTransactions
        .filter(t => {
            if (t.type === TransactionType.TRANSFER) {
                const isFromUserAccount = userAccountIds.has(t.fromAccountId);
                const isToUserAccount = userAccountIds.has(t.toAccountId);
                return isFromUserAccount && !isToUserAccount;
            }
            return false;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate savings growth: transactions TO savings accounts
    const savingsThisMonth = thisMonthTransactions
        .filter(t => {
            // Count deposits to savings accounts or transfers to savings accounts
            if (t.type === TransactionType.DEPOSIT) {
                return savingsAccountIds.has(t.toAccountId);
            }
            if (t.type === TransactionType.TRANSFER) {
                return savingsAccountIds.has(t.toAccountId);
            }
            return false;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const savingsLastMonth = lastMonthTransactions
        .filter(t => {
            // Count deposits to savings accounts or transfers to savings accounts
            if (t.type === TransactionType.DEPOSIT) {
                return savingsAccountIds.has(t.toAccountId);
            }
            if (t.type === TransactionType.TRANSFER) {
                return savingsAccountIds.has(t.toAccountId);
            }
            return false;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const calculateTrend = (current: number, previous: number): string => {
        if (previous === 0) {
            return current > 0 ? '+100%' : '+0%';
        }
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${Math.round(change)}%`;
    };

    const incomeTrend = calculateTrend(incomeThisMonth, incomeLastMonth);
    const expensesTrend = calculateTrend(expensesThisMonth, expensesLastMonth);
    const savingsTrend = calculateTrend(savingsThisMonth, savingsLastMonth);

    // Generate chart data from real transactions
    const getChartData = () => {
        if (period === 'yearly') {
            // Group transactions by month
            const monthlyData: Record<number, number> = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            transactions.forEach(transaction => {
                const date = new Date(transaction.createdAt);
                const month = date.getMonth();
                if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                }
                // Count expenses (outgoing transfers to external accounts)
                if (transaction.type === TransactionType.TRANSFER) {
                    const isFromUserAccount = userAccountIds.has(transaction.fromAccountId);
                    const isToUserAccount = userAccountIds.has(transaction.toAccountId);
                    if (isFromUserAccount && !isToUserAccount) {
                        monthlyData[month] += transaction.amount;
                    }
                }
            });

            return monthNames.map((name, index) => ({
                label: name,
                value: monthlyData[index] || 0,
                percentage: '+0%', // Could calculate trend if needed
            }));
        } else if (period === 'monthly') {
            // Group by week of current month
            const weeklyData: Record<number, number> = {};
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            transactions.forEach(transaction => {
                const date = new Date(transaction.createdAt);
                if (date >= startOfMonth && date <= now) {
                    const week = Math.floor((date.getDate() - 1) / 7);
                    if (!weeklyData[week]) {
                        weeklyData[week] = 0;
                    }
                    if (transaction.type === TransactionType.TRANSFER) {
                        const isFromUserAccount = userAccountIds.has(transaction.fromAccountId);
                        const isToUserAccount = userAccountIds.has(transaction.toAccountId);
                        if (isFromUserAccount && !isToUserAccount) {
                            weeklyData[week] += transaction.amount;
                        }
                    }
                }
            });

            return Array.from({ length: 4 }, (_, i) => ({
                label: `Week ${i + 1}`,
                value: weeklyData[i] || 0,
                percentage: '+0%',
            }));
        } else {

            const dailyData: Record<number, number> = {};
            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            transactions.forEach(transaction => {
                const date = new Date(transaction.createdAt);
                date.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff >= 0 && daysDiff < 7) {
                    const dayOfWeek = date.getDay();
                    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Sunday=6
                    if (!dailyData[adjustedDay]) {
                        dailyData[adjustedDay] = 0;
                    }
                    if (transaction.type === TransactionType.TRANSFER) {
                        const isFromUserAccount = userAccountIds.has(transaction.fromAccountId);
                        const isToUserAccount = userAccountIds.has(transaction.toAccountId);
                        if (isFromUserAccount && !isToUserAccount) {
                            dailyData[adjustedDay] += transaction.amount;
                        }
                    }
                }
            });

            return dayNames.map((name, index) => ({
                label: name,
                value: dailyData[index] || 0,
                percentage: '+0%',
            }));
        }
    };

    const chartData = getChartData();

    const groupTransactionsByDate = (transactions: Transaction[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const grouped: Record<string, Transaction[]> = {
            today: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        };

        transactions.forEach((transaction) => {
            const transactionDate = new Date(transaction.createdAt);
            transactionDate.setHours(0, 0, 0, 0);

            if (transactionDate.getTime() === today.getTime()) {
                grouped.today.push(transaction);
            } else if (transactionDate >= lastWeek) {
                grouped.lastWeek.push(transaction);
            } else if (transactionDate >= lastMonth) {
                grouped.lastMonth.push(transaction);
            } else {
                grouped.older.push(transaction);
            }
        });

        return grouped;
    };

    const filteredTransactions = transactions.filter((transaction) => {
        if (activeFilters.category && transaction.type !== activeFilters.category) return false;
        return true;
    });

    const groupedTransactions = groupTransactionsByDate(filteredTransactions);

    const clearFilters = () => {
        setActiveFilters({ category: null });
    };

    const hasActiveFilters = activeFilters.category !== null;

    const handleViewAllTransactions = () => {
        transactionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleDeleteUserAccount = async (iban: string) => {
        try {
            await userApi.deleteMyAccount(iban);

            toast({
                title: t('account.deleteAccount.success'),
                description: t('account.deleteAccount.successDescription', { iban }),
            });
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="text-lg text-gray-600">{t('common.loading')}...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            <DashboardHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onDeleteAccount={() => setDeleteUserAccountModalOpen(true)}
            />

            <main className="mx-auto max-w-450 p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-8">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <StatCard
                                title={t('dashboard.income')}
                                amount={formatCurrency(income, 'EUR')}
                                trend={incomeTrend}
                                variant="primary"
                            />
                            <StatCard
                                title={t('dashboard.expenses')}
                                amount={formatCurrency(expenses, 'EUR')}
                                trend={expensesTrend}
                            />
                            <StatCard
                                title={t('dashboard.savings')}
                                amount={formatCurrency(savingsTotal, 'EUR')}
                                trend={savingsTrend}
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border bg-white p-6"
                        >
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500">{t('dashboard.totalBalance')}</p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight financial-amount text-gray-900 sm:text-3xl md:text-4xl">
                                        {formatCurrency(totalBalance, 'EUR')}
                                    </h2>
                                </div>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger className="h-9 w-28.75 text-xs sm:h-10 sm:w-35 sm:text-sm">
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
                                    <div className={period === 'yearly' ? 'min-w-150 md:min-w-0' : ''}>
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
                            ref={transactionsRef}
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
                                                        <label className="mb-2 block text-xs font-medium text-gray-700">{t('dashboard.transactionsConfig.filter.type') || 'Type'}</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.values(TransactionType).map((type) => (
                                                                <FilterToggleButton
                                                                    key={type}
                                                                    value={type}
                                                                    isActive={activeFilters.category === type}
                                                                    onClick={() => setActiveFilters({ ...activeFilters, category: activeFilters.category === type ? null : type })}
                                                                />
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
                                {isLoadingTransactions ? (
                                    <div className="py-12 text-center text-gray-500">
                                        {t('common.loading')}...
                                    </div>
                                ) : (
                                    <>
                                        {Object.entries(groupedTransactions).map(([group, groupTransactions]) => {
                                            if (groupTransactions.length === 0) return null;

                                            const getGroupLabel = () => {
                                                switch (group) {
                                                    case 'today':
                                                        return t('dashboard.transactionsConfig.groups.today') || 'Today';
                                                    case 'lastWeek':
                                                        return t('dashboard.transactionsConfig.groups.lastWeek') || 'Last Week';
                                                    case 'lastMonth':
                                                        return t('dashboard.transactionsConfig.groups.lastMonth') || 'Last Month';
                                                    default:
                                                        return t('dashboard.transactionsConfig.groups.older') || 'Older';
                                                }
                                            };

                                            return (
                                    <div key={group} className="space-y-4">
                                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                                            <span className="text-sm font-medium text-gray-600">
                                                            {getGroupLabel()}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {groupTransactions.length} {t('dashboard.transactions')}
                                            </span>
                                        </div>

                                                    {groupTransactions.map((transaction) => {
                                                        const account = accounts.find(acc => acc.id === transaction.fromAccountId);
                                                        return (
                                                            <RealTransactionItem
                                                key={transaction.id}
                                                                transaction={transaction}
                                                                accountName={account?.name || account?.iban}
                                            />
                                                        );
                                                    })}
                                    </div>
                                            );
                                        })}

                                        {filteredTransactions.length === 0 && !isLoadingTransactions && (
                                    <div className="py-12 text-center text-gray-500">
                                                {t('dashboard.transactionsConfig.noTransactions') || 'No transactions found.'}
                                    </div>
                                        )}
                                    </>
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
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const currentAccountsCount = accounts.filter(acc => acc.type === AccountType.CURRENT).length;
                                        const isDeleteDisabled = currentAccountsCount <= 1;
                                        const handleDeleteClick = () => {
                                            if (!isDeleteDisabled) {
                                                setDeleteAccountType(AccountType.CURRENT);
                                                setDeleteAccountModalOpen(true);
                                            }
                                        };
                                        return (
                                            <motion.button
                                                onClick={handleDeleteClick}
                                                whileHover={!isDeleteDisabled ? { scale: 1.05 } : {}}
                                                whileTap={!isDeleteDisabled ? { scale: 0.95 } : {}}
                                                disabled={isDeleteDisabled}
                                                className={`flex items-center justify-center rounded-full p-2 transition-all ${
                                                    isDeleteDisabled
                                                        ? 'bg-gray-100 cursor-not-allowed opacity-50'
                                                        : 'bg-red-100 cursor-pointer hover:bg-red-200'
                                                }`}
                                                aria-label="Delete account"
                                                title={isDeleteDisabled ? t('dashboard.deleteAccountModal.cannotDeleteLastCurrentTooltip') : t('dashboard.deleteAccountModal.deleteAccountTooltip')}
                                            >
                                                <Trash2 className={`h-4 w-4 ${isDeleteDisabled ? 'text-gray-400' : 'text-red-600'}`} />
                                            </motion.button>
                                        );
                                    })()}
                                    <motion.button
                                        onClick={() => setAddAccountModalOpen(true)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-200"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('dashboard.addCard')}
                                    </motion.button>
                                </div>
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
                                        {cards.length > 0 && cards[currentCardIndex] && (
                                            <CreditCard
                                                cardNumber={cards[currentCardIndex].cardNumber}
                                                cardType={cards[currentCardIndex].cardType}
                                                expiryDate={cards[currentCardIndex].expiryDate}
                                                firstName={cards[currentCardIndex].firstName}
                                                lastName={cards[currentCardIndex].lastName}
                                                accountName={cards[currentCardIndex].accountName}
                                                cvv={cards[currentCardIndex].cvv}
                                                onEditAccountName={
                                                    cards[currentCardIndex]?.account?.type === AccountType.CURRENT
                                                        ? () => {
                                                              setSelectedAccountForEdit(cards[currentCardIndex]?.account || null);
                                                              setEditAccountNameModalOpen(true);
                                                          }
                                                        : undefined
                                                }
                                            />
                                        )}
                                        {cards.length === 0 && !isLoadingAccounts && (
                                            <div className="py-12 text-center text-gray-500">
                                                Aucun compte disponible
                                            </div>
                                        )}
                                        {isLoadingAccounts && (
                                            <div className="py-12 text-center text-gray-500">
                                                {t('common.loading')}...
                                            </div>
                                        )}
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

                            <div className="mt-4 space-y-3">
                                <ActionButton
                                    icon={List}
                                    label={t('dashboard.viewAllTransactions')}
                                    onClick={handleViewAllTransactions}
                                    className="w-full"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <ActionButton
                                        icon={ArrowDown}
                                        label="Ajouter de l'argent"
                                        onClick={() => setAddMoneyModalOpen(true)}
                                    />
                                    <ActionButton
                                        icon={ArrowUp}
                                        label={t('dashboard.sendMoney')}
                                        onClick={() => setSendMoneyModalOpen(true)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <StatRow
                                    icon={ArrowUp}
                                    label={t('dashboard.incomeThisMonth')}
                                    amount={formatCurrency(incomeThisMonth, 'EUR')}
                                />
                                <StatRow
                                    icon={ArrowDown}
                                    label={t('dashboard.expensesThisMonth')}
                                    amount={formatCurrency(expensesThisMonth, 'EUR')}
                                />
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
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const savingsAccountsCount = accounts.filter(acc => acc.type === AccountType.SAVINGS).length;
                                        const hasSavingsAccounts = savingsAccountsCount > 0;
                                        const handleSavingsDeleteClick = () => {
                                            setDeleteAccountType(AccountType.SAVINGS);
                                            setDeleteAccountModalOpen(true);
                                        };
                                        return (
                                            <>
                                                {hasSavingsAccounts && (
                                                    <motion.button
                                                        onClick={handleSavingsDeleteClick}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex items-center justify-center rounded-full p-2 bg-red-100 cursor-pointer hover:bg-red-200 transition-all"
                                                        aria-label="Delete savings account"
                                                        title={t('dashboard.deleteAccountModal.deleteAccountTooltip')}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    onClick={() => setAddSavingsModalOpen(true)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-gray-200"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    {t('dashboard.addAccount')}
                                                </motion.button>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {(() => {
                                    const savingsAccounts = accounts.filter(acc => acc.type === AccountType.SAVINGS);
                                    const variants: Array<'blue' | 'yellow' | 'orange'> = ['blue', 'yellow', 'orange'];
                                    
                                    if (savingsAccounts.length === 0) {
                                        return (
                                            <div className="py-8 text-center text-gray-500">
                                                {t('dashboard.noSavingsAccounts')}
                                            </div>
                                        );
                                    }
                                    
                                    return savingsAccounts.map((account, index) => {
                                        const formattedBalance = formatCurrency(account.balance, account.currency || 'EUR');
                                        const { progress, targetAmount } = calculateSavingsProgress(account, t);
                                        const variant = variants[index % variants.length];
                                        
                                        return (
                                            <SavingsGoalItem
                                                key={account.id}
                                                name={account.name || account.iban}
                                                currentAmount={formattedBalance}
                                                targetAmount={targetAmount}
                                                progress={progress}
                                                variant={variant}
                                            />
                                        );
                                    });
                                })()}
                            </div>
                        </motion.div>

                        {isLoadingNews ? (
                            <div className="rounded-3xl border border-gray-200 bg-white p-6">
                                <p className="text-center text-sm text-gray-500">Chargement des actualités...</p>
                            </div>
                        ) : news.length > 0 ? (
                            <NewsCard news={news} />
                        ) : (
                            <div className="rounded-3xl border border-gray-200 bg-white p-6">
                                <p className="text-center text-sm text-gray-500">Aucune actualité disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <AddAccountModal 
                open={addAccountModalOpen} 
                onOpenChange={setAddAccountModalOpen}
                onSuccess={loadAccounts}
            />
            <AddSavingsModal 
                open={addSavingsModalOpen} 
                onOpenChange={setAddSavingsModalOpen}
                accounts={accounts}
                onSuccess={loadAccounts}
            />
            <DeleteAccountModal
                open={deleteAccountModalOpen}
                onOpenChange={(open: boolean) => {
                    setDeleteAccountModalOpen(open);
                    if (!open) {
                        setDeleteAccountType(undefined);
                    }
                }}
                accounts={accounts}
                accountType={deleteAccountType}
                onSuccess={() => {
                    loadAccounts();
                    loadTransactions();
                }}
            />
            <DeleteUserAccountModal
                isOpen={deleteUserAccountModalOpen}
                onClose={() => setDeleteUserAccountModalOpen(false)}
                onConfirm={handleDeleteUserAccount}
            />
            <EditAccountNameModal
                open={editAccountNameModalOpen}
                onOpenChange={setEditAccountNameModalOpen}
                accountId={selectedAccountForEdit?.id || ''}
                currentName={selectedAccountForEdit?.name || ''}
                onSuccess={loadAccounts}
            />
            <SendMoneyModal
                open={sendMoneyModalOpen}
                onOpenChange={setSendMoneyModalOpen}
                onSuccess={() => {
                    loadAccounts();
                    loadTransactions();
                }}
            />
            <AddMoneyModal
                open={addMoneyModalOpen}
                onOpenChange={setAddMoneyModalOpen}
                onSuccess={() => {
                    loadAccounts();
                    loadTransactions();
                }}
            />
        </div>
    );
}

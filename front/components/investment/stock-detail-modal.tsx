'use client';

import * as React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import type { Stock } from './types';
import { StockAdminModal } from './stock-admin-modal';
import { DeleteStockModal } from './delete-stock-modal';
import type { CreateStockFormInput, UpdateStockFormInput } from '@avenir/shared/schemas/stock.schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { placeOrderSchema, type PlaceOrderInput } from '@avenir/shared/schemas/investment.schema';

const API_BASE_URL = 'http://localhost:3001/api';

interface StockChartProps {
  symbol: string;
  currentPrice: number;
  period: string;
  animationKey: number;
  stockId: string;
}

const StockChart = React.memo<StockChartProps>(({ symbol, currentPrice, period, animationKey, stockId }) => {
  const [chartData, setChartData] = React.useState<Array<{ date: string; value: number }>>([]);
  const [isLoadingChart, setIsLoadingChart] = React.useState(true);
  const [isSimulatedData, setIsSimulatedData] = React.useState(false);
  const { t } = useLanguage();

  const generateFallbackData = React.useCallback((basePrice: number, periodType: string) => {
    let fallbackData: Array<{ date: string; value: number }> = [];
    if (periodType === 'monthly') {
      fallbackData = Array.from({ length: 29 }, (_, i) => ({
        date: new Date(2024, 11, i + 1).toISOString().split('T')[0],
        value: basePrice * (0.85 + Math.random() * 0.3),
      }));
    } else if (periodType === 'weekly') {
      fallbackData = Array.from({ length: 6 }, (_, i) => ({
        date: new Date(2024, 11, 18 + i).toISOString().split('T')[0],
        value: basePrice * (0.95 + Math.random() * 0.1),
      }));
    } else {
      fallbackData = Array.from({ length: 11 }, (_, i) => ({
        date: new Date(2024, i, 1).toISOString().split('T')[0],
        value: basePrice * (0.7 + Math.random() * 0.6),
      }));
    }

    fallbackData.push({
      date: new Date().toISOString().split('T')[0],
      value: basePrice,
    });

    return fallbackData;
  }, []);

  React.useEffect(() => {
    const fetchStockPrices = async () => {
      setIsLoadingChart(true);
      setIsSimulatedData(false);
      try {
        const response = await fetch(`${API_BASE_URL}/investment/prices/${stockId}?period=${period}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.prices && data.prices.length > 0) {
            const formattedData = data.prices.map((price: any) => ({
              date: new Date(price.timestamp).toISOString().split('T')[0],
              value: price.price,
            }));

            const lastDataPoint = formattedData[formattedData.length - 1];
            const today = new Date().toISOString().split('T')[0];

            if (lastDataPoint.date !== today) {
              formattedData.push({
                date: today,
                value: currentPrice,
              });
            } else {
              formattedData[formattedData.length - 1].value = currentPrice;
            }

            setChartData(formattedData);
          } else {
            setChartData(generateFallbackData(currentPrice, period));
            setIsSimulatedData(true);
          }
        } else {
          setChartData(generateFallbackData(currentPrice, period));
          setIsSimulatedData(true);
        }
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        setChartData(generateFallbackData(currentPrice, period));
        setIsSimulatedData(true);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchStockPrices();
  }, [stockId, period, currentPrice, generateFallbackData]);

  if (isLoadingChart) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div key={animationKey} className="relative">
      {isSimulatedData && (
        <div className="absolute top-2 right-2 z-10 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md border border-orange-300 shadow-sm">
          <span className="font-medium">{t('dashboard.simulatedData') || 'Simulated Data'}</span>
        </div>
      )}
      <style>{`
        @keyframes drawLine-${animationKey} {
          to {
            stroke-dashoffset: 0;
          }
        }
        .chart-line-${animationKey} path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine-${animationKey} 2s ease-out forwards;
        }
      `}</style>
      <ChartContainer config={{
        value: {
          label: symbol,
          color: 'hsl(262, 83%, 58%)',
        },
      }} className="aspect-auto h-[300px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[150px]"
                nameKey="value"
                labelFormatter={(value) => {
                  return new Date(value).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                }}
              />
            }
          />
          <Line
            dataKey="value"
            type="monotone"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={2}
            dot={false}
            className={`chart-line-${animationKey}`}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
});

StockChart.displayName = 'StockChart';

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onPurchaseSuccess?: () => void;
}

export const StockDetailModal = ({ isOpen, onClose, stock, onPurchaseSuccess }: StockDetailModalProps) => {
  const { t } = useLanguage();
  const { isDirector, isLoading: isLoadingUser } = useAuth();
  const [period, setPeriod] = React.useState('yearly');
  const [amount, setAmount] = React.useState('');
  const [shares, setShares] = React.useState('');
  const [animationKey, setAnimationKey] = React.useState(0);
  const [availableBalance, setAvailableBalance] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isWarning, setIsWarning] = React.useState(false);
  const [orderType, setOrderType] = React.useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = React.useState('');
  const [orderSide, setOrderSide] = React.useState<'BUY' | 'SELL'>('BUY');
  const [availableShares, setAvailableShares] = React.useState(0);

  const form = useForm<PlaceOrderInput>({
    resolver: zodResolver(placeOrderSchema),
    mode: 'onChange',
    defaultValues: {
      stockId: stock?.id || '',
      side: 'BID',
      type: 'MARKET',
      quantity: 0,
    },
  });
  const [pendingOrders, setPendingOrders] = React.useState<any[]>([]);
  const [orderBook, setOrderBook] = React.useState<{
    bids: Array<{ price: number; quantity: number }>;
    asks: Array<{ price: number; quantity: number }>;
  }>({ bids: [], asks: [] });
  const [trades, setTrades] = React.useState<Array<{
    id: string;
    price: number;
    quantity: number;
    buyerId: string;
    sellerId: string;
    side: 'BUY' | 'SELL';
    createdAt: string;
  }>>([]);
  const [activeTab, setActiveTab] = React.useState<'time-sales' | 'market-depth'>('time-sales');

  // Admin states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isAdminSubmitting, setIsAdminSubmitting] = React.useState(false);
  const [adminStockData, setAdminStockData] = React.useState<{
    isin: string | null;
    isActive: boolean;
  } | null>(null);
  const [deleteError, setDeleteError] = React.useState<string>('');

  const fetchTrades = async () => {
    if (!stock) return;
    try {
      const response = await fetch(`${API_BASE_URL}/investment/trades/${stock.id}?limit=20`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchPendingOrders = async () => {
    if (!stock) return;
    try {
      const response = await fetch(`${API_BASE_URL}/investment/orders?stockId=${stock.id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const orders = await response.json();
        const activeOrders = orders.filter((order: any) =>
          order.state === 'PENDING' || order.state === 'PARTIAL'
        );
        setPendingOrders(activeOrders);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const fetchOrderBook = async () => {
    if (!stock) return;
    try {
      const response = await fetch(`${API_BASE_URL}/investment/orderbook/${stock.id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setOrderBook({
          bids: data.bids.slice(0, 5),
          asks: data.asks.slice(0, 5),
        });
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/investment/order/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        await fetchPendingOrders();
        await fetchBalance();
        await fetchOrderBook();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      setError('An error occurred while canceling order');
    }
  };

  // Fetch admin stock data when edit modal opens
  React.useEffect(() => {
    const fetchAdminStockData = async () => {
      if (isEditModalOpen && stock && isDirector) {
        try {
          const response = await fetch(`${API_BASE_URL}/investment/admin/stocks`, {
            credentials: 'include',
          });
          if (response.ok) {
            const stocks = await response.json();
            const adminStock = stocks.find((s: any) => s.id === stock.id);
            if (adminStock) {
              setAdminStockData({
                isin: adminStock.isin,
                isActive: adminStock.isActive,
              });
            }
          }
        } catch (error) {
          console.error('Error fetching admin stock data:', error);
        }
      }
    };

    fetchAdminStockData();
  }, [isEditModalOpen, stock, isDirector]);

  // Admin handlers
  const handleUpdateStock = async (data: CreateStockFormInput | UpdateStockFormInput) => {
    if (!stock) return;
    if (!('id' in data)) return;
    setIsAdminSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/investment/admin/stocks/${stock.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('admin.stock.updateError'));
      }

      setIsEditModalOpen(false);
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err.message || t('admin.stock.updateError'));
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleDeleteStock = async () => {
    if (!stock) return;
    setIsAdminSubmitting(true);
    setDeleteError(''); // Reset error
    try {
      const response = await fetch(`${API_BASE_URL}/investment/admin/stocks/${stock.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t('admin.stock.deleteError'));
      }

      // Success: close modal and refresh
      setIsDeleteModalOpen(false);
      setDeleteError('');
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
      onClose();
    } catch (err: any) {
      // Error: set error state and re-throw to prevent modal from closing
      const errorMessage = err.message || t('admin.stock.deleteError');
      setDeleteError(errorMessage);
      throw err; // Re-throw to be caught by DeleteStockModal
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1);
      document.body.style.overflow = 'hidden';
      fetchBalance();
      fetchAvailableShares();
      fetchPendingOrders();
      fetchOrderBook();
      fetchTrades();
    } else {
      document.body.style.overflow = 'unset';
      setAmount('');
      setShares('');
      setError('');
      setIsWarning(false);
      setOrderType('MARKET');
      setLimitPrice('');
      setOrderSide('BUY');
      setPendingOrders([]);
      setOrderBook({ bids: [], asks: [] });
      setTrades([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Separate effect for chart animation when period changes
  React.useEffect(() => {
    if (isOpen) {
      setAnimationKey(prev => prev + 1);
    }
  }, [period, isOpen]);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/investment/balance`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableShares = async () => {
    if (!stock) return;

    try {
      const response = await fetch(`${API_BASE_URL}/investment/portfolio`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const position = data.positions.find((p: any) => p.stockId === stock.id);
        setAvailableShares(position?.quantity || 0);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const TRANSACTION_FEE = 1;
  const numericAmount = parseFloat(amount) || 0;
  const numericLimitPrice = parseFloat(limitPrice) || 0;
  const numericShares = parseFloat(shares) || 0;
  const effectivePrice = orderType === 'LIMIT' && numericLimitPrice > 0 ? numericLimitPrice : stock?.currentPrice || 0;

  const totalCost = numericAmount + TRANSACTION_FEE;
  const maxAmount = availableBalance - TRANSACTION_FEE;
  const numberOfShares = stock && numericAmount > 0 ? numericAmount / effectivePrice : 0;
  const totalRevenue = numericAmount - TRANSACTION_FEE;

  const canBuy = React.useMemo(() => {
    const hasValidQuantity = numericShares > 0;
    const hasValidLimitPrice = orderType === 'MARKET' || (orderType === 'LIMIT' && numericLimitPrice > 0);

    if (orderSide === 'BUY') {
      return hasValidQuantity && totalCost <= availableBalance && hasValidLimitPrice;
    } else {
      return hasValidQuantity && numericShares <= availableShares && hasValidLimitPrice;
    }
  }, [orderSide, numericShares, numericAmount, totalCost, availableBalance, numericLimitPrice, orderType, availableShares]);

  if (!stock) return null;

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;
    const price = orderType === 'LIMIT' && numericLimitPrice > 0 ? numericLimitPrice : stock.currentPrice;
    const calculatedShares = numAmount > 0 ? numAmount / price : 0;
    setShares(numAmount > 0 ? calculatedShares.toFixed(2) : '');
  };

  const handleSharesChange = (value: string) => {
    setShares(value);
    const numShares = parseFloat(value) || 0;
    const price = orderType === 'LIMIT' && numericLimitPrice > 0 ? numericLimitPrice : stock.currentPrice;
    const calculatedAmount = numShares > 0 ? numShares * price : 0;
    setAmount(numShares > 0 ? calculatedAmount.toFixed(2) : '');
  };

  const handleLimitPriceChange = (value: string) => {
    setLimitPrice(value);
    if (shares) {
      const numShares = parseFloat(shares) || 0;
      const numPrice = parseFloat(value) || 0;
      const calculatedAmount = numShares > 0 && numPrice > 0 ? numShares * numPrice : 0;
      setAmount(calculatedAmount > 0 ? calculatedAmount.toFixed(2) : '');
    }
  };

  const handleBuy = async () => {
    if (!stock) return;

    // Update form values before submission
    form.setValue('stockId', stock.id);
    form.setValue('side', orderSide === 'BUY' ? 'BID' : 'ASK');
    form.setValue('type', orderType);
    form.setValue('quantity', parseFloat(shares) || 0);

    if (orderType === 'LIMIT') {
      form.setValue('limitPrice', numericLimitPrice);
    }

    // Trigger form submission which will validate with Zod
    await form.handleSubmit(onSubmitOrder)();
  };

  const onSubmitOrder = async (data: PlaceOrderInput) => {
    setIsPurchasing(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/investment/order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();

        setAmount('');
        setShares('');
        setLimitPrice('');
        setOrderType('MARKET');
        form.reset();

        if (responseData.warning && responseData.message) {
          setError(responseData.message);
          setIsWarning(true);
        } else {
          setError('');
          setIsWarning(false);
        }

        await fetchBalance();
        await fetchAvailableShares();
        await fetchPendingOrders();
        await fetchOrderBook();

        if (!responseData.warning) {
          onClose();
        }

        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('An error occurred while placing order');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    <Image src={stock.logo} alt={stock.symbol} width={48} height={48} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{stock.symbol}</h2>
                    <p className="text-sm text-gray-500">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isDirector && !isLoadingUser && (
                    <>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50"
                        title={t('admin.stock.edit')}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                        title={t('admin.stock.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-xl border bg-white p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{t('dashboard.investmentPage.currentPrice')}</p>
                        <p className="text-3xl font-bold text-gray-900">{stock.price}</p>
                      </div>
                      <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="h-9 w-[115px] text-xs sm:h-10 sm:w-[140px] sm:text-sm">
                          <SelectValue placeholder={t('dashboard.investmentPage.selectPeriod')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yearly">{t('dashboard.yearly')}</SelectItem>
                          <SelectItem value="monthly">{t('dashboard.monthly')}</SelectItem>
                          <SelectItem value="weekly">{t('dashboard.weekly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <StockChart
                      symbol={stock.symbol}
                      currentPrice={stock.currentPrice}
                      period={period}
                      animationKey={animationKey}
                      stockId={stock.id}
                    />

                    {/* Time & Sales + Market Depth Tabs */}
                    <motion.div
                      className="mt-4 rounded-lg border border-gray-200 bg-white overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <div className="border-b border-gray-200 bg-gray-50">
                        <div className="flex relative">
                          <motion.button
                            onClick={() => setActiveTab('time-sales')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
                              activeTab === 'time-sales'
                                ? 'text-purple-700 bg-white border-b-2 border-purple-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {t('dashboard.investmentPage.timeSales')}
                          </motion.button>
                          <motion.button
                            onClick={() => setActiveTab('market-depth')}
                            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
                              activeTab === 'market-depth'
                                ? 'text-purple-700 bg-white border-b-2 border-purple-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {t('dashboard.investmentPage.marketDepth')}
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-4">
                        <AnimatePresence mode="wait">
                          {activeTab === 'time-sales' ? (
                            <motion.div
                              key="time-sales"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className="max-h-[300px] overflow-y-auto"
                            >
                            {trades.length > 0 ? (
                              <div className="space-y-1">
                                {/* Header */}
                                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase sticky top-0 bg-white">
                                  <span>{t('dashboard.investmentPage.time')}</span>
                                  <span className="text-right">{t('dashboard.investmentPage.price')}</span>
                                  <span className="text-right">{t('dashboard.investmentPage.quantity')}</span>
                                  <span className="text-right">{t('dashboard.investmentPage.total')}</span>
                                </div>
                                {/* Trades List */}
                                {trades.slice(0, 10).map((trade, index) => {
                                  const tradeTime = new Date(trade.createdAt);
                                  const hours = tradeTime.getHours().toString().padStart(2, '0');
                                  const minutes = tradeTime.getMinutes().toString().padStart(2, '0');
                                  const seconds = tradeTime.getSeconds().toString().padStart(2, '0');
                                  const total = trade.price * trade.quantity;

                                  const isBuy = trade.side === 'BUY';
                                  const priceColor = isBuy ? 'text-green-600' : 'text-red-600';
                                  const bgColor = isBuy ? 'bg-green-50' : 'bg-red-50';
                                  const borderColor = isBuy ? 'border-l-green-500' : 'border-l-red-500';

                                  return (
                                    <motion.div
                                      key={trade.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                                      className={`grid grid-cols-4 gap-2 py-2 text-xs rounded border-l-2 ${borderColor} ${bgColor} px-2`}
                                    >
                                      <span className="text-gray-600">{hours}:{minutes}:{seconds}</span>
                                      <span className={`text-right font-semibold ${priceColor}`}>€{trade.price.toFixed(2)}</span>
                                      <span className="text-right text-gray-700 font-medium">{trade.quantity.toFixed(2)}</span>
                                      <span className="text-right font-semibold text-gray-900">€{total.toFixed(2)}</span>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 text-center py-8">{t('dashboard.investmentPage.noTradesYet')}</div>
                            )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="market-depth"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                            <div className="grid grid-cols-2 gap-4">
                              {/* BID (Buy) Side */}
                              <div>
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600 uppercase">
                                  <span>{t('dashboard.investmentPage.bid')}</span>
                                </div>
                                <div className="space-y-1">
                                  {orderBook.bids.length > 0 ? (
                                    orderBook.bids.map((bid, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="flex items-center justify-between rounded bg-blue-50 px-3 py-2 text-xs"
                                      >
                                        <span className="font-semibold text-blue-700">€{bid.price?.toFixed(2) || 'Market'}</span>
                                        <span className="text-gray-600">{bid.quantity.toFixed(2)}</span>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center py-2">{t('dashboard.investmentPage.noBids')}</div>
                                  )}
                                </div>
                              </div>

                              {/* ASK (Sell) Side */}
                              <div>
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600 uppercase">
                                  <span>{t('dashboard.investmentPage.ask')}</span>
                                </div>
                                <div className="space-y-1">
                                  {orderBook.asks.length > 0 ? (
                                    orderBook.asks.map((ask, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                                        className="flex items-center justify-between rounded bg-purple-50 px-3 py-2 text-xs"
                                      >
                                        <span className="font-semibold text-purple-700">€{ask.price?.toFixed(2) || 'Market'}</span>
                                        <span className="text-gray-600">{ask.quantity.toFixed(2)}</span>
                                      </motion.div>
                                    ))
                                  ) : (
                                    <div className="text-xs text-gray-400 text-center py-2">{t('dashboard.investmentPage.noAsks')}</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Spread Indicator */}
                            {orderBook.bids.length > 0 && orderBook.asks.length > 0 && orderBook.bids[0]?.price && orderBook.asks[0]?.price && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="mt-3 pt-3 border-t border-gray-200 text-center"
                              >
                                <div className="text-xs text-gray-500">
                                  {t('dashboard.investmentPage.spread')}: €{(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
                                </div>
                              </motion.div>
                            )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    {pendingOrders.length > 0 && (
                      <div className="mt-4 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {t('dashboard.investmentPage.pendingOrders')} ({pendingOrders.length})
                          </h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.date')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.pair')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.type')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.side')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.price')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('dashboard.investmentPage.amount')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {pendingOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-xs font-medium text-gray-900 whitespace-nowrap">
                                    {stock.symbol}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                    {order.orderType || order.type}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      order.side === 'BID'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {order.side === 'BID' ? t('dashboard.investmentPage.buy') : t('dashboard.investmentPage.sell')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs font-medium text-gray-900 text-right whitespace-nowrap">
                                    €{order.limitPrice?.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-900 text-right whitespace-nowrap">
                                    {order.remainingQuantity.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => cancelOrder(order.id)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-red-50"
                                      title={t('dashboard.investmentPage.cancelOrder')}
                                      aria-label={t('dashboard.investmentPage.cancelOrder')}
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="rounded-xl border bg-white p-6">
                    {/* Buy/Sell Toggle */}
                    <div className="mb-6 flex justify-center">
                      <div className="inline-flex rounded-full bg-gray-100 p-1">
                        <button
                          onClick={() => setOrderSide('SELL')}
                          className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${
                            orderSide === 'SELL'
                              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t('dashboard.investmentPage.sell')}
                        </button>
                        <button
                          onClick={() => setOrderSide('BUY')}
                          className={`rounded-full px-8 py-2.5 text-sm font-medium transition-all ${
                            orderSide === 'BUY'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {t('dashboard.investmentPage.buy')}
                        </button>
                      </div>
                    </div>

                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      {orderSide === 'BUY' ? t('dashboard.investmentPage.buyShares') : t('dashboard.investmentPage.sellShares')}
                    </h3>

                    <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">{t('dashboard.investmentPage.yourPosition')}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-900">{availableShares.toFixed(2)} {t('dashboard.investmentPage.shares')}</p>
                        <p className="text-xs text-blue-600">≈ €{(availableShares * stock.currentPrice).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('dashboard.investmentPage.orderType')}</label>
                        <Select value={orderType} onValueChange={(value: 'MARKET' | 'LIMIT') => setOrderType(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('dashboard.investmentPage.selectOrderType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MARKET">{t('dashboard.investmentPage.marketOrder')}</SelectItem>
                            <SelectItem value="LIMIT">{t('dashboard.investmentPage.limitOrder')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-gray-500">
                          {orderType === 'MARKET' ? t('dashboard.investmentPage.executeImmediately') : t('dashboard.investmentPage.executeAtPrice')}
                        </p>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        orderType === 'LIMIT' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="pb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">{t('dashboard.investmentPage.limitPrice')}</label>
                          <input
                            type="number"
                            value={limitPrice}
                            onChange={(e) => handleLimitPriceChange(e.target.value)}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {t('dashboard.investmentPage.currentPriceLabel')}: €{stock.currentPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        orderSide === 'BUY' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="pb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">{t('dashboard.investmentPage.amountToInvest')}</label>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            max={maxAmount}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {t('dashboard.investmentPage.availableBalance')}: €{availableBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">{t('dashboard.investmentPage.numberOfShares')}</label>
                        <input
                          type="number"
                          value={shares}
                          onChange={(e) => handleSharesChange(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          max={orderSide === 'SELL' ? availableShares : undefined}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {orderSide === 'SELL'
                            ? `${t('dashboard.investmentPage.available')}: ${availableShares.toFixed(2)} ${t('dashboard.investmentPage.shares')}`
                            : `${t('dashboard.investmentPage.pricePerShare')}: €${effectivePrice.toFixed(2)}`
                          }
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('dashboard.investmentPage.pricePerShare')}</span>
                            <span className="font-medium text-gray-900">€{effectivePrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('dashboard.investmentPage.numberOfShares')}</span>
                            <span className="font-medium text-gray-900">{numberOfShares.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t('dashboard.investmentPage.transactionFee')}</span>
                            <span className="font-medium text-gray-900">€{TRANSACTION_FEE.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-900">{t('dashboard.investmentPage.total')}</span>
                              <span className={`font-semibold ${orderSide === 'BUY' ? 'text-red-600' : 'text-green-600'}`}>
                                {orderSide === 'BUY' ? '-' : '+'}€{orderSide === 'BUY' ? totalCost.toFixed(2) : totalRevenue.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {orderSide === 'BUY' && numericAmount > maxAmount && (
                        <p className="text-sm text-red-600">{t('dashboard.investmentPage.insufficientBalance')}</p>
                      )}

                      {orderSide === 'SELL' && numericShares > availableShares && (
                        <p className="text-sm text-red-600">{t('dashboard.investmentPage.insufficientShares', { shares: availableShares.toFixed(2) })}</p>
                      )}

                      {error && (
                        <p className={`text-sm ${isWarning ? 'text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3' : 'text-red-600'}`}>
                          {isWarning && '⚠️ '}
                          {error}
                        </p>
                      )}

                      {Object.keys(form.formState.errors).length > 0 && (
                        <div className="space-y-1">
                          {form.formState.errors.quantity && (
                            <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                          )}
                          {form.formState.errors.limitPrice && (
                            <p className="text-sm text-red-600">{form.formState.errors.limitPrice.message}</p>
                          )}
                          {form.formState.errors.stockId && (
                            <p className="text-sm text-red-600">{form.formState.errors.stockId.message}</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={handleBuy}
                        disabled={!canBuy || isPurchasing || isLoading}
                        className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
                          !canBuy || isPurchasing || isLoading
                            ? 'cursor-not-allowed bg-white text-black/30 border border-black/10'
                            : orderSide === 'BUY'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        }`}
                      >
                        {isPurchasing
                          ? (orderSide === 'BUY' ? t('dashboard.investmentPage.purchasing') : t('dashboard.investmentPage.selling'))
                          : `${orderSide === 'BUY' ? t('dashboard.investmentPage.buy') : t('dashboard.investmentPage.sell')} ${numberOfShares > 0 ? `${numberOfShares.toFixed(2)} ${numberOfShares >= 1 ? t('dashboard.investmentPage.shares') : t('dashboard.investmentPage.share')}` : ''}`
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Admin Modals */}
          <StockAdminModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleUpdateStock}
            mode="update"
            initialData={{
              id: stock.id,
              symbol: stock.symbol,
              name: stock.name || '',
              isin: adminStockData?.isin || '',
              currentPrice: stock.currentPrice.toString(),
              isActive: adminStockData?.isActive ?? true,
            }}
            isLoading={isAdminSubmitting}
          />

          <DeleteStockModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setDeleteError('');
            }}
            onConfirm={handleDeleteStock}
            stockSymbol={stock.symbol}
            isLoading={isAdminSubmitting}
            error={deleteError}
          />
        </>
      )}
    </AnimatePresence>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard-header';
import { StockTicker } from '@/components/investment/stock-ticker';
import { PortfolioLineChart } from '@/components/investment/portfolio-line-chart';
import { PortfolioDonutChart } from '@/components/investment/portfolio-donut-chart';
import { PortfolioDistribution } from '@/components/investment/portfolio-distribution';
import { StockListItem } from '@/components/investment/stock-list-item';
import { MarketInsightItem } from '@/components/investment/market-insight-item';
import { StockDetailModal } from '@/components/investment/stock-detail-modal';
import { InvestmentLoading } from '@/components/investment/investment-loading';
import { EmptyState } from '@/components/investment/empty-state';
import { StockAdminPanel } from '@/components/investment/stock-admin-panel';
import type { ChartConfig } from '@/components/ui/chart';
import type { Stock } from '@/components/investment/types';
import type { PortfolioSummary, StockData } from '@/types/investment';
import { fetchJSON } from '@/lib/api-client';
import { getAvatarUrl, formatCurrency, formatPercent, getStockColor } from '@/lib/investment-utils';
import { MARKET_INSIGHTS } from '@/constants/investment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CHART_COLORS = [
  'hsl(262, 83%, 58%)',
  'hsl(270, 70%, 62%)',
  'hsl(330, 81%, 60%)',
  'hsl(24, 100%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(221, 83%, 53%)',
];

interface InvestmentClientProps {
  initialStocks: StockData[];
  initialPortfolio: PortfolioSummary | null;
}

export const InvestmentClient = ({ initialStocks, initialPortfolio }: InvestmentClientProps) => {
  const { t } = useLanguage();
  const { isDirector, isLoading: isLoadingUser } = useAuth();
  const [activeTab, setActiveTab] = useState('investment');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>(initialStocks);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(initialPortfolio);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<'yearly' | 'monthly' | 'weekly'>('yearly');
  const [portfolioHistory, setPortfolioHistory] = useState<Array<{ date: string; value: number }>>([]);
  const [profitsBreakdown, setProfitsBreakdown] = useState<Array<{ symbol: string; name: string; profitLoss: number; percentage: number }>>([]);

  const fetchStocks = async () => {
    const data = await fetchJSON<StockData[]>(`${API_BASE_URL}/api/investment/stocks`);
    if (data) setStocks(data);
  };

  const fetchPortfolio = async () => {
    const data = await fetchJSON<PortfolioSummary>(`${API_BASE_URL}/api/investment/portfolio`);
    if (data) setPortfolio(data);
  };

  const fetchPortfolioHistory = async (selectedPeriod: string) => {
    const data = await fetchJSON<{ history: Array<{ date: string; value: number }> }>(
      `${API_BASE_URL}/api/investment/portfolio/history?period=${selectedPeriod}`
    );
    if (data) setPortfolioHistory(data.history);
  };

  const fetchProfitsBreakdown = async (selectedPeriod: string) => {
    const data = await fetchJSON<{ breakdown: Array<{ symbol: string; name: string; profitLoss: number; percentage: number }> }>(
      `${API_BASE_URL}/api/investment/profits/breakdown?period=${selectedPeriod}`
    );
    if (data) setProfitsBreakdown(data.breakdown);
  };

  const refreshData = async () => {
    await Promise.all([fetchStocks(), fetchPortfolio(), fetchPortfolioHistory(period), fetchProfitsBreakdown(period)]);
  };

  useEffect(() => {
    if (stocks.length === 0 || portfolio === null) {
      setIsLoading(true);
      refreshData().finally(() => setIsLoading(false));
    }
  }, []);

  useEffect(() => {
    fetchPortfolioHistory(period);
    fetchProfitsBreakdown(period);
  }, [period]);

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const tickerStocks = stocks.map(stock => ({
    id: stock.id,
    symbol: stock.symbol,
    name: stock.name,
    price: `$${stock.currentPrice.toFixed(2)}`,
    change: formatPercent(stock.changePercent ?? 0),
    isPositive: (stock.changePercent ?? 0) >= 0,
    logo: getAvatarUrl(stock.symbol, getStockColor(stock.symbol)),
    currentPrice: stock.currentPrice,
  }));

  const profitsChartData = profitsBreakdown.map((item, index) => ({
    name: item.symbol,
    value: item.profitLoss,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const profitsChartConfig = profitsBreakdown.reduce((config, item) => {
    config[item.symbol] = {
      label: item.name,
      color: profitsChartData.find(d => d.name === item.symbol)?.fill || 'hsl(262, 83%, 58%)',
    };
    return config;
  }, {} as Record<string, { label: string; color: string }>) satisfies ChartConfig;

  const totalProfits = profitsBreakdown.reduce((sum, item) => sum + item.profitLoss, 0);

  const distributionItems = portfolio?.positions.map(position => ({
    symbol: position.symbol,
    percentage: (position.currentValue / portfolio.totalValue) * 100,
    amount: formatCurrency(position.currentValue),
    color: `#${getStockColor(position.symbol)}`,
  })) ?? [];

  const myAssets = portfolio?.positions.map(position => {
    const stockData = stocks.find(s => s.id === position.stockId);
    return {
      symbol: position.symbol,
      name: position.name,
      logo: getAvatarUrl(position.symbol, getStockColor(position.symbol)),
      price: formatCurrency(position.currentValue),
      change: formatPercent(position.profitLossPercent),
      isPositive: position.profitLossPercent >= 0,
      quantity: position.quantity,
      invested: formatCurrency(position.totalInvested),
      stockData: stockData ? {
        id: stockData.id,
        symbol: stockData.symbol,
        name: stockData.name,
        price: `$${stockData.currentPrice.toFixed(2)}`,
        change: formatPercent(stockData.changePercent ?? 0),
        isPositive: (stockData.changePercent ?? 0) >= 0,
        logo: getAvatarUrl(stockData.symbol, getStockColor(stockData.symbol)),
        currentPrice: stockData.currentPrice,
      } : null,
    };
  }) ?? [];

  if (isLoading) return <InvestmentLoading />;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="mx-auto max-w-[1800px] p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <StockTicker stocks={tickerStocks} onStockClick={handleStockClick} />
        </motion.div>

        {isDirector && !isLoadingUser && (
          <StockAdminPanel onStockChange={refreshData} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <PortfolioLineChart
              title={t('dashboard.investmentPage.portfolioValue')}
              description={`${formatCurrency(portfolio?.yesterdayIncome ?? 0)} (${formatPercent(portfolio?.yesterdayIncomePercent ?? 0)}) ${t('dashboard.investmentPage.yesterdaysIncome')}`}
              currentValue={formatCurrency(portfolio?.totalValue ?? 0)}
              change={formatPercent(portfolio?.totalProfitLossPercent ?? 0)}
              isPositive={(portfolio?.totalProfitLossPercent ?? 0) >= 0}
              data={portfolioHistory}
              period={period}
              onPeriodChange={setPeriod}
              totalInvested={formatCurrency(portfolio?.totalInvested ?? 0)}
              totalProfit={formatCurrency(portfolio?.totalProfitLoss ?? 0)}
              totalProfitPercent={formatPercent(portfolio?.totalProfitLossPercent ?? 0)}
              isProfitPositive={(portfolio?.totalProfitLossPercent ?? 0) >= 0}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <PortfolioDonutChart
              title={t('dashboard.investmentPage.totalProfits')}
              description=""
              totalAmount={formatCurrency(totalProfits)}
              centerLabel={`${formatPercent(portfolio?.totalProfitLossPercent ?? 0)} total`}
              data={profitsChartData}
              config={profitsChartConfig}
              period={period}
              onPeriodChange={setPeriod}
            />
          </motion.div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PortfolioDistribution title={t('dashboard.investmentPage.portfolioDistribution')} items={distributionItems} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border bg-white p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.investmentPage.myAssets')}</h3>
              {myAssets.length > 0 && (
                <button className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                  {t('dashboard.investmentPage.viewAll')}
                </button>
              )}
            </div>
            {myAssets.length === 0 ? (
              <EmptyState
                title={t('dashboard.investmentPage.emptyState.myAssets')}
                description={t('dashboard.investmentPage.emptyState.myAssetsDescription')}
              />
            ) : (
              <div className="space-y-3">
                {myAssets.map((asset, index) => (
                  <StockListItem
                    key={asset.symbol}
                    symbol={asset.symbol}
                    name={asset.name}
                    logo={asset.logo}
                    price={asset.price}
                    change={asset.change}
                    isPositive={asset.isPositive}
                    quantity={asset.quantity}
                    invested={asset.invested}
                    index={index}
                    onClick={asset.stockData ? () => handleStockClick(asset.stockData!) : undefined}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-white p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.investmentPage.marketInsight')}</h3>
              <button className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">
                {t('dashboard.investmentPage.viewAll')}
              </button>
            </div>
            <div className="space-y-3">
              {MARKET_INSIGHTS.map((insight, index) => (
                <MarketInsightItem key={index} {...insight} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <StockDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stock={selectedStock}
        onPurchaseSuccess={refreshData}
      />
    </div>
  );
};

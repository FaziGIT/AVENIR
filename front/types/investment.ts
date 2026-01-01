export interface PortfolioPosition {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  yesterdayIncome: number;
  yesterdayIncomePercent: number;
  positions: PortfolioPosition[];
}

export interface StockData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  bestBid: number | null;
  bestAsk: number | null;
  change: number;
  changePercent: number;
}

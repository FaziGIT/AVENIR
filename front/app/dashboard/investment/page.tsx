import { Suspense } from 'react';
import { InvestmentClient } from '@/components/investment/investment-client';
import { InvestmentLoading } from '@/components/investment/investment-loading';
import { fetchStocks, fetchPortfolio } from '@/lib/investment-api';

export const dynamic = 'force-dynamic';

const InvestmentContent = async () => {
  const [stocks, portfolio] = await Promise.all([fetchStocks(), fetchPortfolio()]);
  return <InvestmentClient initialStocks={stocks} initialPortfolio={portfolio} />;
};

export default function InvestmentPage() {
  return (
    <Suspense fallback={<InvestmentLoading />}>
      <InvestmentContent />
    </Suspense>
  );
}

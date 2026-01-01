import { cookies } from 'next/headers';
import type { PortfolioSummary, StockData } from '@/types/investment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const getAuthCookies = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  return allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
};

const fetchFromAPI = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const authCookies = await getAuthCookies();
    if (!authCookies) return null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookies,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) return null;

    return response.json();
  } catch {
    return null;
  }
};

export const fetchStocks = async (): Promise<StockData[]> => {
  const data = await fetchFromAPI<StockData[]>('/api/investment/stocks');
  return data ?? [];
};

export const fetchPortfolio = async (): Promise<PortfolioSummary | null> => {
  return fetchFromAPI<PortfolioSummary>('/api/investment/portfolio');
};

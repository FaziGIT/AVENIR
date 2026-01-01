'use client';

import * as React from 'react';
import { Label, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { EmptyState } from '@/components/investment/empty-state';

interface PortfolioDonutChartProps {
  title: string;
  description: string;
  totalAmount: string;
  centerLabel: string;
  data: Array<{ name: string; value: number; fill: string }>;
  config: ChartConfig;
  period: 'yearly' | 'monthly' | 'weekly';
  onPeriodChange: (period: 'yearly' | 'monthly' | 'weekly') => void;
}

export const PortfolioDonutChart = ({
  title,
  description,
  totalAmount,
  centerLabel,
  data,
  config,
  period,
  onPeriodChange,
}: PortfolioDonutChartProps) => {
  const { t } = useLanguage();

  const isEmpty = data.length === 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-start pb-4">
        <div className="flex w-full items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
            <CardDescription className="text-sm text-gray-500">{description}</CardDescription>
          </div>
          {!isEmpty && (
            <Select value={period} onValueChange={onPeriodChange}>
              <SelectTrigger className="h-9 w-[115px] text-xs sm:h-10 sm:w-[140px] sm:text-sm">
                <SelectValue placeholder={t('dashboard.investmentPage.selectPeriod')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">{t('dashboard.yearly')}</SelectItem>
                <SelectItem value="monthly">{t('dashboard.monthly')}</SelectItem>
                <SelectItem value="weekly">{t('dashboard.weekly')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 -mt-4 pb-0 pt-0">
        {isEmpty ? (
          <EmptyState
            title={t('dashboard.investmentPage.emptyState.totalProfits')}
            description={t('dashboard.investmentPage.emptyState.totalProfitsDescription')}
          />
        ) : (
          <>
            <ChartContainer config={config} className="mx-auto aspect-square w-full max-h-[320px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const data = payload[0];
                    const itemConfig = config[data.name as keyof typeof config];
                    const color = data.payload.fill;

                    return (
                      <div className="min-w-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 shrink-0 rounded"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {itemConfig?.label || data.name}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {data.value?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={95} strokeWidth={5}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <g>
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalAmount}
                              </tspan>
                            </text>
                            <foreignObject
                              x={(viewBox.cx || 0) - 60}
                              y={(viewBox.cy || 0) + 10}
                              width="120"
                              height="30"
                            >
                              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                <ArrowUp className="h-3 w-3 text-green-600" />
                                <span>{centerLabel}</span>
                              </div>
                            </foreignObject>
                          </g>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {data.map((item) => {
                const itemConfig = config[item.name as keyof typeof config];
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: itemConfig?.color || item.fill,
                      }}
                    />
                    <span className="text-xs text-gray-600">
                      {itemConfig?.label || item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

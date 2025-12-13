'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type BarChartData = {
  label: string;
  value: number;
  percentage: string;
};

type BarChartProps = {
  data: BarChartData[];
  highlightIndex?: number;
  className?: string;
};

export const BarChart = ({ data, highlightIndex = 5, className }: BarChartProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const series = [{
    name: 'Amount',
    data: data.map(item => item.value * 100)
  }];

  const options: any = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        borderRadiusApplication: 'end',
        dataLabels: {
          position: 'top',
        },
        columnWidth: '70%',
        colors: {
          ranges: [{
            from: 0,
            to: 100000,
            color: '#e5e7eb'
          }],
        }
      }
    },
    colors: data.map((_, index) => index === highlightIndex ? '#383bfe' : '#e5e7eb'),
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        return data[opts.dataPointIndex].percentage;
      },
      offsetY: -25,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: data.map((_, index) => index === highlightIndex ? '#383bfe' : '#6b7280')
      },
      background: {
        enabled: false
      }
    },
    stroke: {
      show: true,
      width: 0
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 5,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20
      }
    },
    xaxis: {
      categories: data.map(item => item.label),
      position: 'bottom',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontWeight: 500
        }
      },
      crosshairs: {
        show: false
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: true,
        formatter: function (val: number) {
          return '$' + (val / 1000).toFixed(0) + 'k';
        },
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
          fontWeight: 500
        }
      },
      min: 0,
      max: 8000,
      tickAmount: 5
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const value = series[seriesIndex][dataPointIndex];
        const percentage = data[dataPointIndex].percentage;
        const month = data[dataPointIndex].label;

        return `<div class="px-4 py-3 bg-gray-900 rounded-lg shadow-lg">
          <div class="text-white font-semibold text-sm mb-1">$${(value).toLocaleString()} (${percentage})</div>
          <div class="text-gray-300 text-xs">${month} 2025</div>
        </div>`;
      }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.15,
        }
      },
      active: {
        filter: {
          type: 'none',
          value: 0,
        }
      }
    },
    fill: {
      type: data.map((_, index) => index === highlightIndex ? 'solid' : 'pattern'),
      pattern: {
        style: data.map((_, index) => index === highlightIndex ? undefined : 'slantedLines'),
        width: 6,
        height: 6,
        strokeWidth: 2
      }
    },
    legend: {
      show: false
    }
  };

  if (!mounted) {
    return (
      <div className="h-[350px] w-full">
        <div className="flex h-full items-end justify-between gap-2 px-4">
          {Array.from({ length: 12 }).map((_, index) => {
            const heights = ['h-32', 'h-40', 'h-20', 'h-16', 'h-32', 'h-56', 'h-32', 'h-48', 'h-60', 'h-40', 'h-20', 'h-16'];
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className={`w-full rounded-t-xl bg-gray-200 animate-pulse ${heights[index]}`} />
                <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

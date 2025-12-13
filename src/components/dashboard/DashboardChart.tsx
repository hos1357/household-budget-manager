import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/format';
import { formatJalaliDate, toJalali, getJalaliWeekDay } from '@/lib/jalali';

interface DashboardChartProps {
  data: { date: string; amount: number }[];
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  const chartData = data.map((item) => {
    const date = new Date(item.date);
    const { jd } = toJalali(date);
    return {
      ...item,
      label: getJalaliWeekDay(date),
      day: jd,
    };
  });

  if (data.every(d => d.amount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A574" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4A574" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCompactCurrency(value)}
            width={80}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-card">
                    <p className="text-sm font-medium">{data.label}</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCompactCurrency(data.amount)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#D4A574"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAmount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

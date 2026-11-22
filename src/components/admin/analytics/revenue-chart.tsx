'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ShoppingCart } from 'lucide-react';

interface TimeSeriesPoint {
  date: string;
  grossSalesCents: number;
  ordersCount: number;
}

interface RevenueChartProps {
  data: TimeSeriesPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const maxSales = Math.max(...data.map((d) => d.grossSalesCents), 10000); // minimum scale $100
  const maxOrders = Math.max(...data.map((d) => d.ordersCount), 5);

  const selectedPoint = activeIdx !== null ? data[activeIdx] : data[data.length - 1];

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Sales & Order Velocity
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">7-day performance breakdown</p>
        </div>

        {selectedPoint && (
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] text-zinc-500 block">Gross Sales ({selectedPoint.date})</span>
              <span className="text-base font-bold text-white">
                {formatCurrency(selectedPoint.grossSalesCents)}
              </span>
            </div>
            <div className="border-l border-zinc-800 pl-6">
              <span className="text-[11px] text-zinc-500 block">Orders ({selectedPoint.date})</span>
              <span className="text-base font-bold text-indigo-400">
                {selectedPoint.ordersCount} orders
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Bar / Trend Chart */}
      <div className="mt-8">
        <div className="h-48 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2">
          {data.map((point, idx) => {
            const heightPercent = Math.max(8, Math.round((point.grossSalesCents / maxSales) * 100));
            const isHovered = activeIdx === idx;

            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Bar */}
                <div className="w-full max-w-[42px] bg-zinc-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:bg-zinc-700/80 transition-colors relative">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all duration-300 rounded-t-md ${
                      isHovered
                        ? 'bg-indigo-500 shadow-lg shadow-indigo-500/30'
                        : 'bg-indigo-600/80 group-hover:bg-indigo-500'
                    }`}
                  />
                </div>

                {/* X-axis date label */}
                <span className="text-[11px] text-zinc-500 mt-3 group-hover:text-zinc-200 transition-colors">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              Gross Revenue
            </span>
          </div>
          <span>Updated in real-time</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ShoppingCart, DollarSign, Sparkles } from 'lucide-react';

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

  const maxSales = Math.max(...data.map((d) => d.grossSalesCents), 15000);
  const selectedPoint = activeIdx !== null ? data[activeIdx] : data[data.length - 1];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Sales Velocity & Revenue
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Real-time daily transaction curve</p>
        </div>

        {selectedPoint && (
          <div className="flex items-center gap-6 bg-zinc-950/60 px-4 py-2 rounded-xl border border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Gross Sales ({selectedPoint.date})
              </span>
              <span className="text-base font-extrabold text-white">
                {formatCurrency(selectedPoint.grossSalesCents)}
              </span>
            </div>
            <div className="border-l border-zinc-800 pl-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Volume
              </span>
              <span className="text-base font-extrabold text-indigo-400">
                {selectedPoint.ordersCount} orders
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart with Subtle Glow Gradient */}
      <div className="mt-8">
        <div className="h-52 w-full flex items-end gap-3 sm:gap-5 pt-8 pb-2">
          {data.map((point, idx) => {
            const heightPercent = Math.max(10, Math.round((point.grossSalesCents / maxSales) * 100));
            const isHovered = activeIdx === idx;

            return (
              <div
                key={point.date}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {/* Bar with gradient and top highlight */}
                <div className="w-full max-w-[48px] bg-zinc-950/80 rounded-t-xl overflow-hidden flex flex-col justify-end group-hover:bg-zinc-900 transition-colors relative border-t border-x border-zinc-850">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all duration-300 rounded-t-lg relative ${
                      isHovered
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/40'
                        : 'bg-gradient-to-t from-indigo-900/60 to-indigo-600/80 group-hover:from-indigo-700 group-hover:to-indigo-500'
                    }`}
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-indigo-300/60 rounded-t-lg" />
                  </div>
                </div>

                {/* X-axis Date */}
                <span
                  className={`text-[11px] font-semibold mt-3 transition-colors ${
                    isHovered ? 'text-indigo-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Chart Footer Indicator */}
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 inline-block" />
              Gross Storefront Sales
            </span>
            <span className="flex items-center gap-1.5 font-medium text-zinc-500 hidden sm:inline-flex">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sub-100ms In-Memory Aggregations
            </span>
          </div>
          <span className="text-[11px]">Hover over bars to inspect daily orders</span>
        </div>
      </div>
    </div>
  );
}

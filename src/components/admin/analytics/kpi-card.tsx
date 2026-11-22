import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
}

export function KpiCard({ title, value, change, isPositive = true, icon: Icon, subtext }: KpiCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {change && (
            <span
              className={`text-xs font-bold ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-xs text-zinc-500">{subtext}</span>}
        </div>
      </div>
    </div>
  );
}

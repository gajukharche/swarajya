import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Award, Package } from 'lucide-react';

interface TopProductItem {
  title: string;
  variantTitle: string | null;
  sku: string;
  unitsSold: number;
  revenueCents: number;
}

interface TopProductsTableProps {
  products: TopProductItem[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Top Selling Products
          </h3>
        </div>
        <span className="text-xs text-zinc-500">By volume sold</span>
      </div>

      {products.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs">
          <Package className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          No sales recorded yet. Once checkout orders are placed, top performers will rank here.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/60">
          {products.map((item, index) => (
            <div key={item.sku || index} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                  #{index + 1}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.title}</h4>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    {item.variantTitle && <span>{item.variantTitle}</span>}
                    {item.variantTitle && <span>&bull;</span>}
                    <span className="font-mono text-zinc-500">SKU: {item.sku}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-zinc-200">
                  {formatCurrency(item.revenueCents)}
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  {item.unitsSold} sold
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

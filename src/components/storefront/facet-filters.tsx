'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, RotateCcw, Check } from 'lucide-react';

export function FacetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'price_asc';
  const currentInStock = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const hasActiveFilters = Boolean(
    searchParams.get('inStock') || searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('sort')
  );

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-zinc-800/80 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Sort Catalog
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="created_desc">Newest Arrivals</option>
        </select>
      </div>

      {/* Availability Toggle */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Availability
        </label>
        <label className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-850 hover:border-zinc-700/80 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-xs font-medium text-zinc-200">In Stock Only</span>
        </label>
      </div>

      {/* Price Bounds */}
      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Price Range ($)
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-zinc-500">$</span>
            <input
              type="number"
              placeholder="Min"
              defaultValue={minPrice}
              onBlur={(e) => updateParam('minPrice', e.target.value || null)}
              className="w-full pl-6 pr-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-zinc-600">&ndash;</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-xs text-zinc-500">$</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam('maxPrice', e.target.value || null)}
              className="w-full pl-6 pr-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

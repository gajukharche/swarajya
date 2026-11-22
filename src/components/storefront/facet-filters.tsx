'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function FacetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'price_asc';
  const currentInStock = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

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

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Sort By
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="created_desc">Newest Arrivals</option>
        </select>
      </div>

      {/* In-Stock Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Availability
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
            className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0"
          />
          In Stock Only
        </label>
      </div>

      {/* Price Range Slider / Inputs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Price Range ($)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParam('minPrice', e.target.value || null)}
            className="w-20 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
          />
          <span className="text-zinc-600">–</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam('maxPrice', e.target.value || null)}
            className="w-20 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
          />
        </div>
      </div>
    </div>
  );
}

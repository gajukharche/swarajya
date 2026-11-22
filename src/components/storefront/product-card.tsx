import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    vendor?: string | null;
    variants: Array<{ priceCents: number; inventoryQuantity: number }>;
    media?: Array<{ url: string }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const prices = product.variants.map((v) => v.priceCents);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
  const imageUrl = product.media?.[0]?.url;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 hover:shadow-2xl transition-all"
    >
      <div className="space-y-3">
        <div className="aspect-square bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-850 overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag className="w-10 h-10 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
          )}
        </div>

        <div>
          <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.title}
          </h4>
          <p className="text-xs text-zinc-400">{product.vendor || 'Apex Outerwear'}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="font-semibold text-white">
          {minPrice === maxPrice
            ? formatCurrency(minPrice)
            : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
        </span>
        <span
          className={`text-xs font-medium ${
            totalStock > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {totalStock > 0 ? 'In Stock' : 'Sold Out'}
        </span>
      </div>
    </Link>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart/cart-store';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    vendor?: string | null;
    variants: Array<{ id?: string; sku?: string; priceCents: number; inventoryQuantity: number }>;
    media?: Array<{ url: string }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const prices = product.variants.map((v) => v.priceCents);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const totalStock = product.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
  const imageUrl = product.media?.[0]?.url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.variants[0];
    if (firstVariant && totalStock > 0) {
      addItem({
        variantId: firstVariant.id || `var-${product.id}`,
        productId: product.id,
        title: product.title,
        variantTitle: 'Standard',
        sku: firstVariant.sku || `SKU-${product.id}`,
        priceCents: firstVariant.priceCents,
        quantity: 1,
        imageUrl,
      });
      openCart();
    }
  };

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group relative bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-between hover:border-zinc-700 hover:shadow-2xl hover:shadow-indigo-950/20 transition-all duration-300"
    >
      <div className="space-y-3">
        {/* Editorial Aspect 4:5 Image Frame */}
        <div className="aspect-[4/5] bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800/60 overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <ShoppingBag className="w-10 h-10 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
          )}

          {/* Stock Status Chip with Live Pulse Dot */}
          <div className="absolute top-2.5 left-2.5">
            {totalStock > 10 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                In Stock
              </span>
            ) : totalStock > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-glow" />
                Only {totalStock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-950/80 backdrop-blur-md text-zinc-400 border border-zinc-700">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick Add Slide-up Action on Desktop */}
          {totalStock > 0 && (
            <div className="absolute inset-x-2 bottom-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block">
              <button
                type="button"
                onClick={handleQuickAdd}
                className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-tight shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              >
                <span>Quick Add to Bag</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="px-1 pt-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-0.5">
            {product.vendor || 'Swarajya Atelier'}
          </span>
          <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.title}
          </h4>
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="mt-3 pt-3 border-t border-zinc-800/70 px-1 flex items-center justify-between">
        <span className="font-bold text-sm text-white">
          {minPrice === maxPrice
            ? formatCurrency(minPrice)
            : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
        </span>
        <span className="text-[11px] font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          View details &rarr;
        </span>
      </div>
    </Link>
  );
}

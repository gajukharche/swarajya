'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Flame,
  Lock,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart/cart-store';

interface VariantItem {
  id: string;
  title: string;
  sku: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  inventoryQuantity: number;
  reservedQuantity: number;
}

interface OptionItem {
  name: string;
  values: Array<{ value: string }>;
}

interface MediaItem {
  url: string;
  altText?: string | null;
}

interface PdpClientProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string | null;
    vendor?: string | null;
    options: OptionItem[];
    variants: VariantItem[];
    media: MediaItem[];
  };
}

export function PdpClient({ product }: PdpClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, openCart } = useCartStore();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const opt of product.options) {
      initial[opt.name] = opt.values[0]?.value || '';
    }
    return initial;
  });

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const selectedVariant = useMemo(() => {
    if (product.options.length === 0) return product.variants[0];

    return (
      product.variants.find((v) => {
        const parts = v.title.split(' / ').map((p) => p.trim());
        return product.options.every((opt, idx) => parts[idx] === selectedOptions[opt.name]);
      }) || product.variants[0]
    );
  }, [product.options, product.variants, selectedOptions]);

  const selectOptionValue = (optionName: string, value: string) => {
    const next = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(next);

    const resolved = product.variants.find((v) => {
      const parts = v.title.split(' / ').map((p) => p.trim());
      return product.options.every((opt, idx) => parts[idx] === next[opt.name]);
    });

    if (resolved) {
      router.replace(`/products/${product.handle}?variant=${resolved.id}`, { scroll: false });
    }
  };

  const availableStock = selectedVariant
    ? selectedVariant.inventoryQuantity - selectedVariant.reservedQuantity
    : 0;
  const isAvailable = availableStock > 0;
  const currentPrice = selectedVariant?.priceCents || 0;
  const comparePrice = selectedVariant?.compareAtPriceCents || null;

  const savingsPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!selectedVariant || !isAvailable) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      sku: selectedVariant.sku,
      priceCents: selectedVariant.priceCents,
      imageUrl: product.media[0]?.url || null,
      quantity,
    });

    setIsAdded(true);
    openCart();
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Media Gallery (Sticky Desktop) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
          <div className="aspect-[4/5] rounded-3xl bg-zinc-950 border border-zinc-800/80 overflow-hidden relative shadow-2xl">
            {product.media.length > 0 ? (
              <img
                src={product.media[activeImageIndex]?.url || product.media[0]?.url}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}

            {/* In-Stock Floating Badge */}
            <div className="absolute top-4 left-4">
              {availableStock > 10 ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                  Ready to Dispatch
                </span>
              ) : isAvailable ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Only {availableStock} left in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/85 backdrop-blur-md text-zinc-400 border border-zinc-700">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {product.media.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.media.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={m.url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Ordering Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {product.vendor || 'Swarajya Outerwear'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              {product.title}
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-2">
              SKU: {selectedVariant?.sku || 'N/A'}
            </p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-4 py-4 border-y border-zinc-800/80">
            <span className="text-3xl font-extrabold text-white">
              {formatCurrency(currentPrice)}
            </span>
            {comparePrice && (
              <span className="text-lg text-zinc-500 line-through">
                {formatCurrency(comparePrice)}
              </span>
            )}
            {savingsPercent && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Save {savingsPercent}%
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Option Selectors */}
          <div className="space-y-5 pt-2">
            {product.options.map((opt) => (
              <div key={opt.name} className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  <span>{opt.name}</span>
                  <span className="text-indigo-400 font-medium normal-case">
                    Selected: {selectedOptions[opt.name]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {opt.values.map((v) => {
                    const isSelected = selectedOptions[opt.name] === v.value;
                    return (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => selectOptionValue(opt.name, v.value)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102'
                            : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quantity Selector & Add to Cart Button */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Quantity
              </span>
              <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 99, q + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={!isAvailable}
              onClick={handleAddToCart}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-tight transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                !isAvailable
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-[0.99]'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : isAvailable ? (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Shopping Bag &bull; {formatCurrency(currentPrice * quantity)}</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
            </button>
          </div>

          {/* Value Props Strip */}
          <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Complimentary shipping over $100</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>30-day effortless returns</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>0% oversell atomic guarantee</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>256-bit Stripe encrypted checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-4 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 lg:hidden flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-zinc-400 line-clamp-1">{product.title}</span>
          <span className="text-base font-extrabold text-white">
            {formatCurrency(currentPrice)}
          </span>
        </div>
        <button
          type="button"
          disabled={!isAvailable}
          onClick={handleAddToCart}
          className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isAvailable ? 'Add to Bag' : 'Sold Out'}</span>
        </button>
      </div>
    </>
  );
}

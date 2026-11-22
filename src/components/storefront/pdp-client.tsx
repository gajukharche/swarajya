'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
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
  const { addItem } = useCartStore();

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
        return product.options.every((opt, idx) => {
          return parts[idx] === selectedOptions[opt.name];
        });
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

  const isAvailable = selectedVariant
    ? selectedVariant.inventoryQuantity - selectedVariant.reservedQuantity > 0
    : false;
  const currentPrice = selectedVariant?.priceCents || 0;
  const comparePrice = selectedVariant?.compareAtPriceCents || null;
  const savingsPercent =
    comparePrice && comparePrice > currentPrice
      ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

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
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      {/* Media Gallery */}
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-2xl">
          {product.media.length > 0 ? (
            <img
              src={product.media[activeImageIndex]?.url || product.media[0]?.url}
              alt={product.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <ShoppingBag className="w-16 h-16" />
            </div>
          )}
        </div>

        {product.media.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {product.media.map((m, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={m.url} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-8">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
            {product.vendor || 'Apex Outerwear'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1">
            {product.title}
          </h1>
          <p className="text-xs font-mono text-zinc-500 mt-2">
            SKU: {selectedVariant?.sku || 'N/A'}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-4 border-y border-zinc-800 py-4">
          <span className="text-3xl font-extrabold text-white">
            {formatCurrency(currentPrice)}
          </span>
          {comparePrice && (
            <span className="text-lg text-zinc-500 line-through">
              {formatCurrency(comparePrice)}
            </span>
          )}
          {savingsPercent && (
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
              Save {savingsPercent}%
            </span>
          )}
        </div>

        {/* Options */}
        {product.options.map((opt) => (
          <div key={opt.name} className="space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-300 uppercase">
              <span>{opt.name}</span>
              <span className="text-indigo-400 font-normal">{selectedOptions[opt.name]}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {opt.values.map((v) => {
                const isSelected = selectedOptions[opt.name] === v.value;
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => selectOptionValue(opt.name, v.value)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {v.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quantity & Add to Cart */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-zinc-400 hover:text-white"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-semibold text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-zinc-400 hover:text-white"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="flex-1 py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Cart
                </>
              ) : isAvailable ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </>
              ) : (
                'Sold Out'
              )}
            </button>
          </div>

          <p className="text-xs text-zinc-500 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? 'bg-emerald-400' : 'bg-red-500'
              }`}
            />
            {isAvailable ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <div className="border-t border-zinc-800 pt-6 space-y-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-800 pt-6">
          <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-center space-y-1">
            <Truck className="w-4 h-4 text-indigo-400 mx-auto" />
            <p className="text-[11px] font-medium text-white">Free Express Shipping</p>
          </div>
          <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400 mx-auto" />
            <p className="text-[11px] font-medium text-white">2-Year Warranty</p>
          </div>
          <div className="p-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg text-center space-y-1">
            <RefreshCw className="w-4 h-4 text-indigo-400 mx-auto" />
            <p className="text-[11px] font-medium text-white">30-Day Returns</p>
          </div>
        </div>
      </div>
    </div>
  );
}

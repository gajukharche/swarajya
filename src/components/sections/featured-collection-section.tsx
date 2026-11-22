import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductItem {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  variants: Array<{ priceCents: number }>;
  media?: Array<{ url: string }>;
}

interface FeaturedCollectionSectionProps {
  settings?: {
    heading?: string;
    subheading?: string;
    collectionHandle?: string;
    productLimit?: number;
  };
  products?: ProductItem[];
}

export function FeaturedCollectionSection({ settings, products = [] }: FeaturedCollectionSectionProps) {
  const heading = settings?.heading || 'Trending Essentials';
  const subheading = settings?.subheading || 'Curated high-performance catalog items.';
  const collectionHandle = settings?.collectionHandle || 'all';

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{heading}</h2>
          <p className="text-sm text-zinc-400 mt-1">{subheading}</p>
        </div>
        <Link
          href={`/collections/${collectionHandle}`}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          View Collection
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-sm">
          No items found in this collection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const price = p.variants[0]?.priceCents || 0;
            const imageUrl = p.media?.[0]?.url;

            return (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                className="group bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 hover:shadow-xl transition-all"
              >
                <div className="space-y-3">
                  <div className="aspect-square bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-850 overflow-hidden relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-xs text-zinc-400">{p.vendor || 'Apex Outerwear'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="font-semibold text-white">{formatCurrency(price)}</span>
                  <span className="text-xs text-emerald-400 font-medium">In Stock</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

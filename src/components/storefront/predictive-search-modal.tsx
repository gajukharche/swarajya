'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, ShoppingBag, ArrowRight, Tag, Flame } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/products/mock-catalog';

interface SearchResultItem {
  id: string;
  title: string;
  handle: string;
  minPriceCents: number;
  primaryImageUrl?: string | null;
}

interface PredictiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = ['Outerwear', 'Titanium', 'Merino', 'EDC', 'Footwear', 'Backpack', 'Living'];

export function PredictiveSearchModal({ isOpen, onClose }: PredictiveSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search querying
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setResults(data.products);
            return;
          }
        }
        // Client-side fallback to mock catalog
        const filtered = MOCK_PRODUCTS.filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            p.productType.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);

        setResults(
          filtered.map((p) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            minPriceCents: p.variants[0].priceCents,
            primaryImageUrl: p.media[0]?.url,
          }))
        );
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 sm:px-6 transition-all"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-silk-enter"
      >
        {/* Search Bar Input */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3 bg-zinc-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all products, apparel, gear, titanium..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-1 py-0.5"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
            aria-label="Close search dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tag Suggestion Chips */}
        <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-zinc-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Popular:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-indigo-600 hover:text-white text-zinc-300 text-[11px] font-medium transition-all shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Search className="w-8 h-8 text-zinc-700 mx-auto" />
              <p className="text-xs text-zinc-400">
                {query.trim()
                  ? `No matching items found for "${query}". Try searching for Outerwear or Titanium.`
                  : 'Start typing to search products, tags, or categories.'}
              </p>
            </div>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                onClick={onClose}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/80 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-indigo-500/50 transition-colors">
                    {p.primaryImageUrl ? (
                      <img
                        src={p.primaryImageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {p.title}
                    </h4>
                    <span className="text-[11px] font-bold text-zinc-400 mt-0.5 block">
                      {formatCurrency(p.minPriceCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0">
                  <span className="text-[11px] font-medium hidden sm:inline">View details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/70 flex items-center justify-between text-[11px] text-zinc-500 px-5">
          <div className="flex items-center gap-3">
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">ESC</kbd> to exit
            </span>
          </div>
          <Link
            href="/collections/all"
            onClick={onClose}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View all 25 products &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

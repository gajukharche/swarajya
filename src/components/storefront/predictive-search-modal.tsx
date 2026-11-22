'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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

export function PredictiveSearchModal({ isOpen, onClose }: PredictiveSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          setResults(data.products || []);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, outerwear, technical gear..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm focus:outline-none"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {results.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">
              {query.trim() ? 'No products found matching your search.' : 'Type to search the catalog...'}
            </p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.handle}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                <div className="w-10 h-10 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.primaryImageUrl ? (
                    <img src={p.primaryImageUrl} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-white truncate">{p.title}</h4>
                  <p className="text-[11px] text-indigo-400 font-medium">
                    {formatCurrency(p.minPriceCents)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

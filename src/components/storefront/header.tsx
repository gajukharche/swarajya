'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, Sparkles } from 'lucide-react';
import { PredictiveSearchModal } from './predictive-search-modal';
import { useCartStore } from '@/lib/cart/cart-store';
import { CartDrawer } from '@/components/cart/cart-drawer';

interface StorefrontHeaderProps {
  collections?: Array<{ id: string; title: string; handle: string }>;
}

export function StorefrontHeader({ collections = [] }: StorefrontHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [badgeAnimated, setBadgeAnimated] = useState(false);
  const { openCart, totalQuantity } = useCartStore();
  const quantity = totalQuantity();

  // Listen for Cmd+K or Ctrl+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger spring pop animation when quantity increases
  useEffect(() => {
    if (quantity > 0) {
      setBadgeAnimated(true);
      const timer = setTimeout(() => setBadgeAnimated(false), 300);
      return () => clearTimeout(timer);
    }
  }, [quantity]);

  return (
    <>
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group font-bold text-xl tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300">
              S
            </span>
            <div className="flex flex-col">
              <span className="text-white text-base leading-tight font-extrabold tracking-tight">Swarajya</span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">Sovereign Commerce</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <Link
              href="/collections/all"
              className="hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              All Products
            </Link>
            {collections.slice(0, 3).map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="hover:text-white transition-colors capitalize relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-indigo-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {col.title}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-all flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3 h-3" />
              <span>Admin Center</span>
            </Link>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Search Pill Trigger (Linear / Raycast Style) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-all cursor-pointer shadow-sm group"
              aria-label="Search Catalog (Command K)"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-indigo-400 transition-colors" />
              <span className="hidden sm:inline text-zinc-500 group-hover:text-zinc-400">Search products...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                ⌘K
              </kbd>
            </button>

            {/* Customer Account Portal */}
            <Link
              href="/account"
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
              aria-label="Customer Account"
              title="Customer Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Slide-Over Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {quantity > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md shadow-indigo-600/40 border-2 border-zinc-950 ${
                    badgeAnimated ? 'animate-spring-pop' : ''
                  }`}
                >
                  {quantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <PredictiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

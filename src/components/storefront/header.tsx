'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User } from 'lucide-react';
import { PredictiveSearchModal } from './predictive-search-modal';
import { useCartStore } from '@/lib/cart/cart-store';
import { CartDrawer } from '@/components/cart/cart-drawer';

interface StorefrontHeaderProps {
  collections?: Array<{ id: string; title: string; handle: string }>;
}

export function StorefrontHeader({ collections = [] }: StorefrontHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, totalQuantity } = useCartStore();
  const quantity = totalQuantity();

  return (
    <>
      <header className="border-b border-zinc-800/80 backdrop-blur sticky top-0 z-40 bg-zinc-950/85">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-600/30">
              S
            </span>
            <span className="text-white">Swarajya</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/collections/all" className="hover:text-white transition-colors">
              All Products
            </Link>
            {collections.slice(0, 3).map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="hover:text-white transition-colors capitalize"
              >
                {col.title}
              </Link>
            ))}
            <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Merchant Admin ↗
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Account Link */}
            <Link
              href="/account"
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
              aria-label="Customer Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {quantity > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {quantity}
                </span>
              )}
            </button>

            <Link
              href="/admin/login"
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              Staff
            </Link>
          </div>
        </div>
      </header>

      <PredictiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}

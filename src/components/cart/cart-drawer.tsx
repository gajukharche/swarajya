'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalCents, totalQuantity } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl text-white">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">
                Your Cart ({totalQuantity()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <ShoppingBag className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400 text-sm">Your cart is currently empty.</p>
                <button
                  onClick={closeCart}
                  className="px-4 py-2 bg-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 items-center justify-between"
                >
                  <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white truncate">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {item.variantTitle}
                    </p>
                    <p className="text-xs font-semibold text-indigo-400 mt-1">
                      {formatCurrency(item.priceCents)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-zinc-500 hover:text-red-400 p-0.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-zinc-800 rounded bg-zinc-900 text-xs">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-2 py-0.5 text-zinc-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-2 py-0.5 text-zinc-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(totalCents())}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500">
                Taxes and shipping calculated at checkout. 15-minute inventory hold applied upon checkout initiation.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

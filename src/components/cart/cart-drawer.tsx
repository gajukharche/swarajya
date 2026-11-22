'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck, Sparkles, Lock } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD_CENTS = 10000; // $100.00

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalCents, totalQuantity } =
    useCartStore();

  if (!isOpen) return null;

  const currentTotal = totalCents();
  const quantity = totalQuantity();
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - currentTotal);
  const progressPercent = Math.min(100, Math.round((currentTotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel bg-zinc-950/95 border-l border-zinc-800/80 flex flex-col shadow-2xl text-white animate-silk-slide">
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Shopping Bag</h2>
                <span className="text-[11px] text-zinc-400">
                  {quantity} {quantity === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-6 py-4 bg-zinc-900/60 border-b border-zinc-800/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add <strong className="text-white">{formatCurrency(remainingForFreeShipping)}</strong> more for Free Shipping
                  </>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Free Express Shipping Unlocked!
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-zinc-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercent >= 100
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                }`}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Your bag is empty</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                    Explore our modern apparel and titanium gear catalog to add items.
                  </p>
                </div>
                <Link
                  href="/collections/all"
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl text-white shadow-lg shadow-indigo-600/20 transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-4 p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 items-center justify-between hover:border-zinc-700 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    {item.variantTitle && (
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                        {item.variantTitle}
                      </span>
                    )}
                    <span className="text-xs font-bold text-indigo-400 mt-1 block">
                      {formatCurrency(item.priceCents * item.quantity)}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950 text-xs overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 font-semibold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/80 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">{formatCurrency(currentTotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-400 font-medium">
                    {remainingForFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Estimated Total</span>
                <span className="text-xl font-extrabold text-white">{formatCurrency(currentTotal)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-tight shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-200" />
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by 0% oversell atomic inventory reservation</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

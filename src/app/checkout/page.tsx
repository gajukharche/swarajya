'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Lock, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCents, clearCart } = useCartStore();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('US');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = totalCents();
  const shipping = subtotal > 15000 ? 0 : 1200;
  const total = subtotal + shipping;

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create PaymentIntent & Reserve Inventory
      const res = await fetch('/api/checkout/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          email,
          shippingAddress: { firstName, lastName, address1, city, province, zip, country },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      // 2. Clear client cart and navigate to confirmation
      clearCart();
      router.push(`/checkout/success?order=${data.checkoutId}&total=${total}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black">
              A
            </span>
            Apex Store
          </Link>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-zinc-400">Your cart is empty.</p>
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-xs font-medium rounded-lg text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSimulatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Customer & Shipping Address Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-semibold text-white">Contact Information</h2>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-semibold text-white">Shipping Address</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Mercer"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="742 Evergreen Terrace"
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="OR"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="97477"
                      className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-950/60 border border-red-800 text-xs text-red-300 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Locking Inventory & Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatCurrency(total)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  0% Oversell Guarantee
                </span>
                <span>•</span>
                <span>Stripe Verified</span>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-8 space-y-6">
                <h3 className="text-base font-semibold text-white">Order Summary</h3>

                <div className="divide-y divide-zinc-800/80 max-h-60 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.variantId} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="text-zinc-500">{item.variantTitle} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-white">
                        {formatCurrency(item.priceCents * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                    <span>Total Due</span>
                    <span className="text-indigo-400">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

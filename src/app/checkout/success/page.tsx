import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string }>;
}) {
  const { order, total } = await searchParams;
  const totalCents = total ? parseInt(total, 10) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Payment Confirmed</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Thank you for your purchase. Your order has been placed in our fulfillment queue.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-xs space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-zinc-500">Order Reference:</span>
            <span className="font-mono text-white font-medium">{order || 'CHK-PENDING'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Total Charged:</span>
            <span className="font-medium text-emerald-400">{formatCurrency(totalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Inventory Status:</span>
            <span className="text-indigo-400 font-medium">Reserved & Committed</span>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

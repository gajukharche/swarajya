'use client';

import React, { useState } from 'react';
import { refundOrderAction } from '@/app/admin/orders/actions';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RefundModalProps {
  orderId: string;
  totalCents: number;
}

export function RefundModal({ orderId, totalCents }: RefundModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amountCents, setAmountCents] = useState(totalCents);
  const [reason, setReason] = useState('Customer Return');
  const [restock, setRestock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-red-400 hover:text-red-300 hover:bg-red-950/20 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Refund
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <RotateCcw className="w-5 h-5 text-red-400" />
            Issue Stripe Refund
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={refundOrderAction} onSubmit={() => setIsSubmitting(true)} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="amountCents" value={amountCents} />
          <input type="hidden" name="restock" value={restock ? 'true' : 'false'} />

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Refund Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              max={(totalCents / 100).toFixed(2)}
              defaultValue={(totalCents / 100).toFixed(2)}
              onChange={(e) => setAmountCents(Math.round(parseFloat(e.target.value || '0') * 100))}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            />
            <span className="block text-[11px] text-zinc-500 mt-1">
              Max refundable: {formatCurrency(totalCents)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Reason for Refund
            </label>
            <input
              type="text"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
            />
            Restock items back into inventory
          </label>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { fulfillOrderAction } from '@/app/admin/orders/actions';
import { Truck, X, Loader2 } from 'lucide-react';

interface FulfillmentModalProps {
  orderId: string;
}

export function FulfillmentModal({ orderId }: FulfillmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [carrier, setCarrier] = useState('USPS');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
      >
        <Truck className="w-3.5 h-3.5" />
        Fulfill Items
      </button>
    );
  }

  const trackingUrl =
    carrier === 'USPS'
      ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
      : carrier === 'FedEx'
      ? `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`
      : `https://www.google.com/search?q=${carrier}+${trackingNumber}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Truck className="w-5 h-5 text-indigo-400" />
            Dispatch Fulfillment
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form action={fulfillOrderAction} onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="trackingUrl" value={trackingUrl} />

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Shipping Carrier
            </label>
            <select
              name="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            >
              <option value="USPS">USPS Express</option>
              <option value="FedEx">FedEx Ground / Express</option>
              <option value="UPS">UPS Worldwide</option>
              <option value="DHL">DHL Express</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Tracking Number
            </label>
            <input
              type="text"
              name="trackingNumber"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 9400 1000 0000 0000 0000 00"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none"
            />
          </div>

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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

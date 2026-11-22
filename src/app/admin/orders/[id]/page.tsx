import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { FulfillmentModal } from '@/components/admin/fulfillment-modal';
import { RefundModal } from '@/components/admin/refund-modal';
import { ArrowLeft, Clock, ShieldCheck, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order = null;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        fulfillments: true,
        refunds: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } catch {}

  if (!order) {
    notFound();
  }

  const shippingAddr = (order.shippingAddress || {}) as Record<string, string>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Order #{order.orderNumber}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()} • Stripe ID: {order.paymentIntentId || 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions: Fulfillment / Refund */}
        <div className="flex items-center gap-3">
          {order.status !== 'FULFILLED' && order.status !== 'REFUNDED' && (
            <FulfillmentModal orderId={order.id} />
          )}
          {order.status !== 'REFUNDED' && (
            <RefundModal orderId={order.id} totalCents={order.totalCents} />
          )}
        </div>
      </div>

      {/* 2-Column Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-white">Purchased Line Items</h2>
            </div>

            <div className="divide-y divide-zinc-800/80 p-6 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {item.variantTitle} • SKU: {item.sku}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatCurrency(item.unitPriceCents)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {formatCurrency(item.totalCents)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-zinc-950/60 p-6 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Paid</span>
                <span className="text-indigo-400">{formatCurrency(order.totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Order Event Timeline
            </h3>

            <div className="space-y-3">
              {order.events.map((evt) => (
                <div key={evt.id} className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">{evt.type}</span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-zinc-400">{evt.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Customer & Shipping</h3>
            <div className="space-y-1 text-xs">
              <p className="font-medium text-white">
                {shippingAddr.firstName} {shippingAddr.lastName}
              </p>
              <p className="text-zinc-400">{order.email}</p>
              <p className="text-zinc-400">{shippingAddr.address1}</p>
              <p className="text-zinc-400">
                {shippingAddr.city}, {shippingAddr.province} {shippingAddr.zip}
              </p>
              <p className="text-zinc-400">{shippingAddr.country}</p>
            </div>
          </div>

          {order.fulfillments.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                Fulfillment Information
              </h3>
              {order.fulfillments.map((f) => (
                <div key={f.id} className="text-xs space-y-1">
                  <p className="text-zinc-400">Carrier: <span className="text-white font-medium">{f.carrier}</span></p>
                  <p className="text-zinc-400">Tracking: <span className="font-mono text-indigo-400">{f.trackingNumber || 'N/A'}</span></p>
                  {f.trackingUrl && (
                    <a
                      href={f.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block pt-1 text-indigo-400 hover:underline"
                    >
                      Track Package ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth/customer-session';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { StorefrontHeader } from '@/components/storefront/header';
import {
  ArrowLeft,
  Package,
  Truck,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Tag,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: CustomerOrderDetailPageProps) {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/account/login');
  }

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
  } catch {
    // DB fallback during build
  }

  if (!order) {
    notFound();
  }

  // Security check: ensure order belongs to this customer or customer email matches
  if (order.customerId && order.customerId !== session.customerId && order.email !== session.email) {
    redirect('/account');
  }

  const shippingAddr = (order.shippingAddress as Record<string, string>) || {};
  const billingAddr = (order.billingAddress as Record<string, string>) || {};
  const fulfillment = order.fulfillments[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <StorefrontHeader />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Navigation back */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account Dashboard
        </Link>

        {/* Order Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  order.status === 'PAID'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : order.status === 'FULFILLED'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : order.status === 'REFUNDED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-zinc-400">Total Amount</span>
            <div className="text-2xl font-extrabold text-white">
              {formatCurrency(order.totalCents, order.currency)}
            </div>
          </div>
        </div>

        {/* 4-Stage Visual Fulfillment Stepper */}
        <div className="my-6 p-6 rounded-2xl glass-panel border border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
            Delivery Lifecycle
          </h3>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Step 1: Placed */}
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-bold mb-2">
                ✓
              </div>
              <span className="text-xs font-semibold text-white">Placed</span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Order Confirmed</span>
            </div>

            {/* Step 2: Payment */}
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-bold mb-2">
                ✓
              </div>
              <span className="text-xs font-semibold text-white">Payment</span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">256-bit Stripe</span>
            </div>

            {/* Step 3: Dispatched */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 border-2 ${
                  fulfillment
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {fulfillment ? '✓' : '3'}
              </div>
              <span className={`text-xs font-semibold ${fulfillment ? 'text-white' : 'text-zinc-500'}`}>
                Dispatched
              </span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">
                {fulfillment?.carrier || 'Packaging'}
              </span>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 border-2 ${
                  order.status === 'FULFILLED'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                {order.status === 'FULFILLED' ? '✓' : '4'}
              </div>
              <span className={`text-xs font-semibold ${order.status === 'FULFILLED' ? 'text-white' : 'text-zinc-500'}`}>
                Delivered
              </span>
              <span className="text-[10px] text-zinc-500 hidden sm:inline">Final Destination</span>
            </div>
          </div>
        </div>

        {/* Tracking Banner if fulfilled */}
        {fulfillment && (
          <div className="my-6 p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center shrink-0 text-indigo-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Package Dispatched</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Carrier: <span className="text-zinc-200 font-medium">{fulfillment.carrier || 'Standard Courier'}</span>
                  {fulfillment.trackingNumber && ` • Tracking: #${fulfillment.trackingNumber}`}
                </p>
              </div>
            </div>

            {fulfillment.trackingNumber && (
              <a
                href={
                  fulfillment.trackingUrl ||
                  `https://www.google.com/search?q=${encodeURIComponent(
                    `${fulfillment.carrier || ''} tracking ${fulfillment.trackingNumber}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
              >
                <span>Track Package</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main items column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Card */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" /> Items in Order
              </h3>

              <div className="divide-y divide-zinc-800/80">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-medium text-white">{item.title}</h4>
                      {item.variantTitle && (
                        <p className="text-xs text-zinc-400">{item.variantTitle}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        SKU: {item.sku} &bull; Qty: {item.quantity} &times; {formatCurrency(item.unitPriceCents, order.currency)}
                      </p>
                    </div>
                    <div className="text-sm font-bold text-zinc-100">
                      {formatCurrency(item.totalCents, order.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Order Summary
              </h3>

              <div className="flex justify-between text-xs text-zinc-400">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-200">
                  {formatCurrency(order.subtotalCents, order.currency)}
                </span>
              </div>

              {order.discountCents > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Promotional Discount
                  </span>
                  <span>-{formatCurrency(order.discountCents, order.currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-zinc-400">
                <span>Shipping</span>
                <span className="font-medium text-zinc-200">
                  {order.shippingCents === 0 ? 'FREE' : formatCurrency(order.shippingCents, order.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-zinc-400">
                <span>Estimated Tax</span>
                <span className="font-medium text-zinc-200">
                  {formatCurrency(order.taxCents, order.currency)}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between text-base font-bold text-white">
                <span>Total Paid</span>
                <span>{formatCurrency(order.totalCents, order.currency)}</span>
              </div>

              {order.refunds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <span className="text-xs font-semibold text-rose-400 block mb-2">Refunds Issued</span>
                  {order.refunds.map((r) => (
                    <div key={r.id} className="flex justify-between text-xs text-rose-300 py-1">
                      <span>{r.reason || 'Refund'}</span>
                      <span>-{formatCurrency(r.amountCents, order.currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            {order.events.length > 0 && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" /> Order History & Events
                </h3>

                <div className="space-y-4">
                  {order.events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">{event.message}</p>
                        <span className="text-[10px] text-zinc-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Addresses */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400" /> Shipping Address
              </h3>
              <div className="text-xs text-zinc-300 space-y-1">
                <p className="font-semibold text-white">
                  {shippingAddr.firstName} {shippingAddr.lastName}
                </p>
                {shippingAddr.company && <p>{shippingAddr.company}</p>}
                <p>{shippingAddr.address1}</p>
                {shippingAddr.address2 && <p>{shippingAddr.address2}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.province} {shippingAddr.zip}
                </p>
                <p>{shippingAddr.country}</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-400" /> Payment Information
              </h3>
              <div className="text-xs text-zinc-400 space-y-1">
                <p className="flex items-center gap-2 text-zinc-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Paid via Stripe
                </p>
                {order.paymentIntentId && (
                  <p className="font-mono text-[11px] text-zinc-500 truncate">
                    ID: {order.paymentIntentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

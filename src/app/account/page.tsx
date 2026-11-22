import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth/customer-session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { StorefrontHeader } from '@/components/storefront/header';
import { logoutCustomerAction } from './actions';
import {
  Package,
  MapPin,
  ExternalLink,
  ShoppingBag,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect('/account/login');
  }

  let customer = null;
  let orders: Array<{
    id: string;
    orderNumber: number;
    createdAt: Date;
    status: string;
    currency: string;
    totalCents: number;
    items: Array<{ id: string; title: string; quantity: number }>;
    fulfillments: Array<{ id: string; carrier: string | null; trackingNumber: string | null; trackingUrl: string | null }>;
  }> = [];

  let addresses: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    zip: string;
    country: string;
    isDefaultShipping: boolean;
  }> = [];

  try {
    const found = await prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: true,
            fulfillments: true,
          },
        },
        addresses: {
          orderBy: { isDefaultShipping: 'desc' },
        },
      },
    });

    if (found) {
      customer = found;
      orders = found.orders;
      addresses = found.addresses;
    }
  } catch {
    // Graceful fallback for static build export
  }

  const totalSpentCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
  const defaultAddress = addresses.find((a) => a.isDefaultShipping) || addresses[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-zinc-800 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Customer Account
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">
              Welcome back, {session.name || session.email}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">{session.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/addresses"
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-sm font-medium text-zinc-300 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-zinc-400" />
              Manage Addresses
            </Link>
            <form action={logoutCustomerAction}>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-sm font-medium text-rose-400 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Orders</span>
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold mt-2">{orders.length}</div>
            <span className="text-xs text-zinc-500 mt-1 block">Lifetime purchases</span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Spent</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold mt-2">{formatCurrency(totalSpentCents)}</div>
            <span className="text-xs text-zinc-500 mt-1 block">Across all orders</span>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Primary Delivery Address</span>
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-medium text-zinc-200 mt-2 truncate">
              {defaultAddress
                ? `${defaultAddress.address1}, ${defaultAddress.city}`
                : 'No default address saved'}
            </div>
            <Link
              href="/account/addresses"
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-1"
            >
              {defaultAddress ? 'Edit address' : 'Add shipping address'} &rarr;
            </Link>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
            <Link
              href="/collections/all"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Continue shopping <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
              <Package className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-300">No orders placed yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                When you make a purchase from our store, your full order history and real-time tracking will appear here.
              </p>
              <Link
                href="/collections/all"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors"
              >
                Browse Store Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const fulfillment = order.fulfillments[0];
                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white text-base">
                          Order #{order.orderNumber}
                        </span>
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

                      <div className="text-xs text-zinc-400 mt-1 flex items-center gap-4">
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>
                          {order.items.reduce((s, i) => s + i.quantity, 0)} item
                          {order.items.reduce((s, i) => s + i.quantity, 0) === 1 ? '' : 's'}
                        </span>
                        <span>&bull;</span>
                        <span className="font-semibold text-zinc-200">
                          {formatCurrency(order.totalCents, order.currency)}
                        </span>
                      </div>

                      {fulfillment?.trackingNumber && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span>
                            {fulfillment.carrier || 'Carrier'}: #{fulfillment.trackingNumber}
                          </span>
                          {fulfillment.trackingUrl && (
                            <a
                              href={fulfillment.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-white inline-flex items-center gap-1 ml-1"
                            >
                              Track <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>View Order Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

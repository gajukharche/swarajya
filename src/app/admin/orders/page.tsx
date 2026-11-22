import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders: Array<{
    id: string;
    orderNumber: number;
    email: string;
    status: string;
    currency: string;
    totalCents: number;
    createdAt: Date;
    items: Array<{ id: string }>;
  }> = [];

  try {
    orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // Database connection fallback during build
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Order Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {orders.length} orders recorded in immutable ledger
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <ShoppingCart className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-base font-medium text-white">No orders placed yet</p>
            <p className="text-xs text-zinc-500">Orders placed through storefront checkout will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Items</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6 font-semibold text-white">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-indigo-400">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs">{o.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          o.status === 'PAID'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                            : o.status === 'FULFILLED'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : o.status === 'REFUNDED'
                            ? 'bg-red-950/60 text-red-300 border-red-800/60'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">{o.items.length} items</td>
                    <td className="py-4 px-6 text-xs text-zinc-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-white">
                      {formatCurrency(o.totalCents, o.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

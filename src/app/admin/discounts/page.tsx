import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Tags, CheckCircle2, XCircle } from 'lucide-react';
import { toggleDiscountStatusAction } from './actions';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  let discounts: Array<{
    id: string;
    code: string;
    type: string;
    value: number;
    usedCount: number;
    maxUses: number | null;
    isActive: boolean;
  }> = [];

  try {
    discounts = await prisma.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Discounts & Promotions</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage percentage, fixed amount, and free shipping promotional codes
          </p>
        </div>

        <Link
          href="/admin/discounts/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Discount
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {discounts.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Tags className="w-12 h-12 text-zinc-600 mx-auto" />
            <p className="text-base font-medium text-white">No active discount codes</p>
            <p className="text-xs text-zinc-500">Create a coupon code to run sales and marketing campaigns.</p>
            <Link
              href="/admin/discounts/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Code
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Code</th>
                  <th className="py-3.5 px-6">Type & Value</th>
                  <th className="py-3.5 px-6">Redemptions</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6 font-mono font-bold text-white text-xs tracking-wider">
                      {d.code}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {d.type === 'PERCENTAGE'
                        ? `${d.value}% Off Subtotal`
                        : d.type === 'FIXED_AMOUNT'
                        ? `${formatCurrency(d.value)} Off`
                        : 'Free Shipping'}
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-400">
                      {d.usedCount} {d.maxUses ? `/ ${d.maxUses} uses` : 'uses'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                          d.isActive
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {d.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <form action={toggleDiscountStatusAction.bind(null, d.id, d.isActive)}>
                        <button
                          type="submit"
                          className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                        >
                          {d.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </form>
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

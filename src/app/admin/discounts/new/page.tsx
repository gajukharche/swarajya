import Link from 'next/link';
import { createDiscountAction } from '@/app/admin/discounts/actions';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewDiscountPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/discounts"
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create Discount Code</h1>
      </div>

      <form action={createDiscountAction} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
            Discount Code
          </label>
          <input
            type="text"
            name="code"
            required
            placeholder="e.g. SUMMER20"
            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Discount Type
            </label>
            <select
              name="type"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Discount Value
            </label>
            <input
              type="number"
              name="value"
              step="any"
              defaultValue="15"
              placeholder="15"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Minimum Purchase ($)
            </label>
            <input
              type="number"
              name="minSubtotal"
              step="any"
              placeholder="0 (optional)"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Max Usages
            </label>
            <input
              type="number"
              name="maxUses"
              placeholder="Unlimited (optional)"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Discount
          </button>
        </div>
      </form>
    </div>
  );
}

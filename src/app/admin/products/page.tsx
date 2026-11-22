import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/products/mock-catalog';
import { Plus, Download, Upload, Package, Edit, Trash2 } from 'lucide-react';
import { deleteProductAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  let products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    vendor: string | null;
    tags: string[];
    variants: Array<{
      id: string;
      priceCents: number;
      inventoryQuantity: number;
      reservedQuantity: number;
    }>;
  }> = [];

  try {
    products = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // Database connection fallback during build
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      vendor: p.vendor,
      tags: p.tags,
      variants: p.variants.map((v) => ({
        id: v.id,
        priceCents: v.priceCents,
        inventoryQuantity: v.inventoryQuantity,
        reservedQuantity: v.reservedQuantity,
      })),
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Catalog Management</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {products.length} products with multi-variant inventory matrices
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/products/export"
            className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Package className="w-12 h-12 text-zinc-600 mx-auto" />
            <div>
              <p className="text-base font-medium text-white">No products in catalog</p>
              <p className="text-sm text-zinc-400 mt-1">Get started by creating your first product or seeding the database.</p>
            </div>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Inventory</th>
                  <th className="py-3.5 px-6">Price Range</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
                  const prices = p.variants.map((v) => v.priceCents);
                  const minPrice = prices.length ? Math.min(...prices) : 0;
                  const maxPrice = prices.length ? Math.max(...prices) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/20">
                      <td className="py-4 px-6">
                        <div>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="font-medium text-white hover:text-indigo-400 transition-colors"
                          >
                            {p.title}
                          </Link>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">/{p.handle}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <span
                          className={totalStock > 0 ? 'text-emerald-400 font-medium' : 'text-red-400'}
                        >
                          {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {p.variants.length} variant{p.variants.length === 1 ? '' : 's'}
                        </p>
                      </td>

                      <td className="py-4 px-6 text-xs font-medium text-white">
                        {minPrice === maxPrice
                          ? formatCurrency(minPrice)
                          : `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <form action={deleteProductAction.bind(null, p.id, p.handle)}>
                            <button
                              type="submit"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

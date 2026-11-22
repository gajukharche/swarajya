import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Plus, Layers, Edit, Trash2 } from 'lucide-react';
import { deleteCollectionAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  let collections: Array<{
    id: string;
    title: string;
    handle: string;
    type: string;
    _count: { products: number };
  }> = [];

  try {
    collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // Database connection fallback during build
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Collections Engine</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Group products into Manual or dynamic Smart collections
          </p>
        </div>

        <Link
          href="/admin/collections/new"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Collection
        </Link>
      </div>

      {/* Collections List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {collections.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <Layers className="w-12 h-12 text-zinc-600 mx-auto" />
            <div>
              <p className="text-base font-medium text-white">No collections found</p>
              <p className="text-sm text-zinc-400 mt-1">
                Create a collection to organize products on your storefront navigation.
              </p>
            </div>
            <Link
              href="/admin/collections/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Collection
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 text-xs uppercase text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6">Collection</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Products</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/20">
                    <td className="py-4 px-6">
                      <div>
                        <Link
                          href={`/admin/collections/${c.id}`}
                          className="font-medium text-white hover:text-indigo-400 transition-colors"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">/{c.handle}</p>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          c.type === 'SMART'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {c.type === 'SMART' ? 'Smart (AST Rule)' : 'Manual'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-zinc-300 font-medium">
                      {c._count.products} product{c._count.products === 1 ? '' : 's'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/collections/${c.id}`}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={deleteCollectionAction.bind(null, c.id, c.handle)}>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

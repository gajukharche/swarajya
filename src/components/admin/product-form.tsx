'use client';

import React, { useState } from 'react';
import { upsertProductAction, ProductFormData } from '@/app/admin/products/actions';
import { generateCartesianVariants } from '@/lib/products/cartesian';
import { MediaUploader } from '@/components/admin/media-uploader';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, RefreshCw, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: ProductFormData;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [handle, setHandle] = useState(initialData?.handle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [vendor, setVendor] = useState(initialData?.vendor || 'In-House');
  const [productType, setProductType] = useState(initialData?.productType || 'Apparel');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || 'new, trending');
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.mediaUrls || []);

  const [options, setOptions] = useState<Array<{ name: string; position: number; values: string[] }>>(
    initialData?.options || [
      { name: 'Size', position: 0, values: ['S', 'M', 'L'] },
      { name: 'Color', position: 1, values: ['Black', 'Navy'] },
    ]
  );

  const [variants, setVariants] = useState(
    initialData?.variants || [
      { title: 'S / Black', sku: 'APX-S-BLK', priceCents: 4999, inventoryQuantity: 20 },
      { title: 'M / Black', sku: 'APX-M-BLK', priceCents: 4999, inventoryQuantity: 25 },
      { title: 'L / Black', sku: 'APX-L-BLK', priceCents: 4999, inventoryQuantity: 15 },
      { title: 'S / Navy', sku: 'APX-S-NVY', priceCents: 4999, inventoryQuantity: 12 },
      { title: 'M / Navy', sku: 'APX-M-NVY', priceCents: 4999, inventoryQuantity: 18 },
      { title: 'L / Navy', sku: 'APX-L-NVY', priceCents: 4999, inventoryQuantity: 10 },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData?.id) {
      setHandle(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const regenerateVariants = () => {
    const baseSku = handle.slice(0, 4) || 'ITEM';
    const generated = generateCartesianVariants(options, baseSku, 4999);
    setVariants(
      generated.map((g) => ({
        title: g.title,
        sku: g.sku,
        priceCents: g.priceCents,
        inventoryQuantity: g.inventoryQuantity,
      }))
    );
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await upsertProductAction({
        id: initialData?.id,
        title,
        handle,
        description,
        vendor,
        productType,
        status: status as 'DRAFT' | 'ACTIVE' | 'ARCHIVED',
        tags,
        options,
        variants,
        mediaUrls,
      });
    } catch (err: unknown) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {initialData?.id ? `Edit: ${initialData.title}` : 'Create New Product'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Fields & Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">General Information</h2>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Apex Technical Jacket"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">URL Handle / Slug</label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="apex-technical-jacket"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Engineered with breathable 3-layer technical fabric..."
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Media Assets (Cloudflare R2)</h2>
            <MediaUploader
              onUploadComplete={(url) => setMediaUrls((prev) => [...prev, url])}
            />
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-3 pt-2">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-zinc-800">
                    <img src={url} alt="Media" className="aspect-square object-cover w-full" />
                    <button
                      type="button"
                      onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-red-400 rounded hover:bg-black"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Options & Cartesian Matrix */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-semibold text-white">Product Options (Cartesian Matrix)</h2>
                <p className="text-xs text-zinc-400">Configure sizes, colors, and generate all SKU combinations.</p>
              </div>
              <button
                type="button"
                onClick={regenerateVariants}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Matrix
              </button>
            </div>

            {/* Options Input List */}
            <div className="space-y-4">
              {options.map((opt, optIdx) => (
                <div key={optIdx} className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const next = [...options];
                        next[optIdx].name = e.target.value;
                        setOptions(next);
                      }}
                      placeholder="Option Name (e.g. Size)"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setOptions(options.filter((_, i) => i !== optIdx))}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={opt.values.join(', ')}
                    onChange={(e) => {
                      const next = [...options];
                      next[optIdx].values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
                      setOptions(next);
                    }}
                    placeholder="Values separated by comma (e.g. S, M, L, XL)"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setOptions([...options, { name: '', position: options.length, values: [] }])}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Option
              </button>
            </div>

            {/* Generated Variants Table */}
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                <span>{variants.length} SKU Combinations</span>
              </div>
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Variant</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4">Price ($)</th>
                    <th className="py-2.5 px-4">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20">
                      <td className="py-2.5 px-4 font-medium text-white">{v.title}</td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="w-32 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded font-mono text-[11px]"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          step="0.01"
                          value={(v.priceCents / 100).toFixed(2)}
                          onChange={(e) => updateVariant(idx, 'priceCents', Math.round(parseFloat(e.target.value || '0') * 100))}
                          className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px]"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="number"
                          value={v.inventoryQuantity}
                          onChange={(e) => updateVariant(idx, 'inventoryQuantity', parseInt(e.target.value || '0', 10))}
                          className="w-20 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px]"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Organization & Status */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE' | 'ARCHIVED')}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none"
            >
              <option value="ACTIVE">Active (Public on Storefront)</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Product Organization</h2>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Vendor / Brand</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Product Category</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="outerwear, waterproof, tech"
                className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

'use client';

import React, { useState } from 'react';
import { upsertCollectionAction, CollectionFormData } from '@/app/admin/collections/actions';
import { SmartCollectionRule, RuleField, RuleOperator } from '@/lib/collections/smart-rules';
import { Save, ArrowLeft, Plus, Trash2, Layers } from 'lucide-react';
import Link from 'next/link';
import { CollectionType } from '@prisma/client';

interface CollectionFormProps {
  initialData?: CollectionFormData;
  availableProducts?: Array<{ id: string; title: string; handle: string }>;
}

export function CollectionForm({ initialData, availableProducts = [] }: CollectionFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [handle, setHandle] = useState(initialData?.handle || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<CollectionType>(initialData?.type || 'MANUAL');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialData?.productIds || []);

  // Smart Rules State
  const [matchType, setMatchType] = useState<'ALL' | 'ANY'>(initialData?.rules?.matchType || 'ALL');
  const [rules, setRules] = useState<SmartCollectionRule[]>(
    initialData?.rules?.rules || [
      { field: 'tag', operator: 'EQUALS', value: 'summer' },
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

  const addRule = () => {
    setRules([...rules, { field: 'priceCents', operator: 'LESS_THAN', value: 5000 }]);
  };

  const updateRule = (index: number, key: keyof SmartCollectionRule, val: unknown) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await upsertCollectionAction({
        id: initialData?.id,
        title,
        handle,
        description,
        type,
        rules: type === 'SMART' ? { matchType, rules } : undefined,
        productIds: type === 'MANUAL' ? selectedProductIds : undefined,
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
            href="/admin/collections"
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {initialData?.id ? `Edit Collection: ${initialData.title}` : 'Create Collection'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save Collection'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">Collection Details</h2>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Summer Technical Capsule"
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
                placeholder="summer-technical-capsule"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Curated apparel engineered for breathability and motion."
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Collection Type & Membership Engine */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-white">Collection Type</h2>

            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                  type === 'MANUAL'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="MANUAL"
                  checked={type === 'MANUAL'}
                  onChange={() => setType('MANUAL')}
                  className="hidden"
                />
                <span className="font-semibold text-sm text-white">Manual Collection</span>
                <span className="text-xs text-zinc-400">Hand-pick products one by one and customize display order.</span>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                  type === 'SMART'
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="SMART"
                  checked={type === 'SMART'}
                  onChange={() => setType('SMART')}
                  className="hidden"
                />
                <span className="font-semibold text-sm text-white">Smart Collection</span>
                <span className="text-xs text-zinc-400">Products are automatically included based on conditions.</span>
              </label>
            </div>

            {/* Smart Rules Builder */}
            {type === 'SMART' && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase text-zinc-300">Rules Engine</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">Products must match:</span>
                    <select
                      value={matchType}
                      onChange={(e) => setMatchType(e.target.value as 'ALL' | 'ANY')}
                      className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-indigo-400 font-medium"
                    >
                      <option value="ALL">all conditions (AND)</option>
                      <option value="ANY">any condition (OR)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                      <select
                        value={rule.field}
                        onChange={(e) => updateRule(idx, 'field', e.target.value as RuleField)}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                      >
                        <option value="tag">Product Tag</option>
                        <option value="title">Product Title</option>
                        <option value="vendor">Vendor</option>
                        <option value="priceCents">Variant Price ($)</option>
                        <option value="inventoryQuantity">Stock Quantity</option>
                      </select>

                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(idx, 'operator', e.target.value as RuleOperator)}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                      >
                        <option value="EQUALS">is equal to</option>
                        <option value="NOT_EQUALS">is not equal to</option>
                        <option value="CONTAINS">contains</option>
                        <option value="STARTS_WITH">starts with</option>
                        <option value="LESS_THAN">is less than</option>
                        <option value="GREATER_THAN">is greater than</option>
                      </select>

                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => updateRule(idx, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                      />

                      <button
                        type="button"
                        onClick={() => removeRule(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addRule}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Condition
                  </button>
                </div>
              </div>
            )}

            {/* Manual Product Association */}
            {type === 'MANUAL' && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <span className="text-xs font-medium uppercase text-zinc-300">Select Products</span>
                {availableProducts.length === 0 ? (
                  <p className="text-xs text-zinc-500">No products available to select.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 border border-zinc-800 rounded-lg p-3 bg-zinc-950/40">
                    {availableProducts.map((p) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/40 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds([...selectedProductIds, p.id]);
                              } else {
                                setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0"
                          />
                          <span className="text-white font-medium">{p.title}</span>
                          <span className="text-zinc-500 font-mono">/{p.handle}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Meta */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Dynamic Collection Sync
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When saving a smart collection, the AST rule evaluator automatically executes across the database and links all matching products. Storefront cache tags will be purged on save.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

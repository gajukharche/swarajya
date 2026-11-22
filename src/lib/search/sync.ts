import { prisma } from '@/lib/prisma';
import { getMeiliClient, PRODUCTS_INDEX } from './meilisearch';
import { revalidateTag } from 'next/cache';

export interface MeiliProductDocument {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  status: string;
  tags: string[];
  inStock: boolean;
  minPriceCents: number;
  maxPriceCents: number;
  skus: string[];
  options: Record<string, string[]>;
  collectionHandles: string[];
  primaryImageUrl: string | null;
  createdAt: number;
}

export async function syncProductToMeili(productId: string): Promise<boolean> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        options: {
          include: { values: true },
        },
        collections: {
          include: { collection: true },
        },
        media: {
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
    });

    if (!product) return false;

    const client = getMeiliClient();
    const index = client.index(PRODUCTS_INDEX);

    if (product.status !== 'ACTIVE') {
      // Remove from index if not active
      try {
        await index.deleteDocument(product.id);
      } catch {
        // Document may not exist yet
      }
      return true;
    }

    const prices = product.variants.map((v) => v.priceCents);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const totalInventory = product.variants.reduce(
      (sum, v) => sum + (v.inventoryQuantity - v.reservedQuantity),
      0
    );

    const optionsMap: Record<string, string[]> = {};
    for (const opt of product.options) {
      optionsMap[`options.${opt.name}`] = opt.values.map((v) => v.value);
    }

    const doc: MeiliProductDocument = {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description || '',
      vendor: product.vendor || '',
      productType: product.productType || '',
      status: product.status,
      tags: product.tags,
      inStock: totalInventory > 0,
      minPriceCents: minPrice,
      maxPriceCents: maxPrice,
      skus: product.variants.map((v) => v.sku),
      options: optionsMap,
      collectionHandles: product.collections.map((c) => c.collection.handle),
      primaryImageUrl: product.media[0]?.url || null,
      createdAt: Math.floor(product.createdAt.getTime() / 1000),
    };

    await index.addDocuments([doc], { primaryKey: 'id' });

    // Invalidate Next.js cache tags
    try {
      revalidateTag(`product:${product.handle}`, 'default');
      revalidateTag('catalog:all', 'default');
    } catch {
      // revalidateTag may not be in request context
    }

    return true;
  } catch (err: unknown) {
    console.warn('Meilisearch sync notice (skipping when indexer unavailable):', err);
    return false;
  }
}

export async function deleteProductFromMeili(productId: string, handle?: string): Promise<boolean> {
  try {
    const client = getMeiliClient();
    await client.index(PRODUCTS_INDEX).deleteDocument(productId);

    if (handle) {
      try {
        revalidateTag(`product:${handle}`, 'default');
        revalidateTag('catalog:all', 'default');
      } catch {}
    }
    return true;
  } catch {
    return false;
  }
}

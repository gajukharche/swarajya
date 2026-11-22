'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { syncProductToMeili, deleteProductFromMeili } from '@/lib/search/sync';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProductStatus } from '@prisma/client';

export interface ProductFormData {
  id?: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  status: ProductStatus;
  tags: string[];
  options: Array<{
    name: string;
    position: number;
    values: string[];
  }>;
  variants: Array<{
    id?: string;
    title: string;
    sku: string;
    priceCents: number;
    compareAtPriceCents?: number;
    inventoryQuantity: number;
    barcode?: string;
  }>;
  mediaUrls: string[];
}

export async function upsertProductAction(data: ProductFormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const cleanHandle = data.handle.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

  let productId = data.id;

  await prisma.$transaction(async (tx) => {
    // 1. Create or update product
    if (productId) {
      await tx.product.update({
        where: { id: productId },
        data: {
          title: data.title,
          handle: cleanHandle,
          description: data.description,
          vendor: data.vendor,
          productType: data.productType,
          status: data.status,
          tags: data.tags,
        },
      });
    } else {
      const created = await tx.product.create({
        data: {
          title: data.title,
          handle: cleanHandle,
          description: data.description,
          vendor: data.vendor,
          productType: data.productType,
          status: data.status,
          tags: data.tags,
        },
      });
      productId = created.id;
    }

    if (!productId) throw new Error('Product ID not found');
    const finalProductId: string = productId;

    // 2. Options and values
    // Clear and rebuild options
    await tx.productOption.deleteMany({ where: { productId: finalProductId } });
    for (let i = 0; i < data.options.length; i++) {
      const opt = data.options[i];
      if (!opt.name.trim() || opt.values.length === 0) continue;

      await tx.productOption.create({
        data: {
          productId: finalProductId,
          name: opt.name.trim(),
          position: i,
          values: {
            create: opt.values.map((v, valIdx) => ({
              value: v.trim(),
              position: valIdx,
            })),
          },
        },
      });
    }

    // 3. Variants
    // Delete variants that are no longer present
    const existingVariants = await tx.productVariant.findMany({
      where: { productId: finalProductId },
      select: { id: true, sku: true },
    });

    const activeSkus = new Set(data.variants.map((v) => v.sku));
    const toDeleteIds = existingVariants
      .filter((ev) => !activeSkus.has(ev.sku))
      .map((ev) => ev.id);

    if (toDeleteIds.length > 0) {
      await tx.productVariant.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
    }

    // Upsert variants
    for (const v of data.variants) {
      await tx.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          title: v.title,
          priceCents: v.priceCents,
          compareAtPriceCents: v.compareAtPriceCents || null,
          inventoryQuantity: v.inventoryQuantity,
          barcode: v.barcode || null,
        },
        create: {
          productId: finalProductId,
          sku: v.sku,
          title: v.title,
          priceCents: v.priceCents,
          compareAtPriceCents: v.compareAtPriceCents || null,
          inventoryQuantity: v.inventoryQuantity,
          barcode: v.barcode || null,
        },
      });
    }

    // 4. Media
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      await tx.productMedia.deleteMany({ where: { productId: finalProductId } });
      await tx.productMedia.createMany({
        data: data.mediaUrls.map((url, idx) => ({
          productId: finalProductId,
          url,
          position: idx,
        })),
      });
    }
  });

  if (productId) {
    await syncProductToMeili(productId);
  }

  try {
    revalidatePath('/admin/products');
    revalidateTag(`product:${cleanHandle}`, 'default');
    revalidateTag('catalog:all', 'default');
  } catch {}

  redirect('/admin/products');
}

export async function deleteProductAction(productId: string, handle: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await prisma.product.delete({
    where: { id: productId },
  });

  await deleteProductFromMeili(productId, handle);

  try {
    revalidatePath('/admin/products');
  } catch {}
}

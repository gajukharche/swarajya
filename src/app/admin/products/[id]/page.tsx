import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/product-form';
import { notFound } from 'next/navigation';
import { ProductStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      options: {
        include: { values: true },
        orderBy: { position: 'asc' },
      },
      variants: {
        orderBy: { createdAt: 'asc' },
      },
      media: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description || '',
    vendor: product.vendor || '',
    productType: product.productType || '',
    status: product.status as ProductStatus,
    tags: product.tags,
    options: product.options.map((opt) => ({
      name: opt.name,
      position: opt.position,
      values: opt.values.map((v) => v.value),
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      priceCents: v.priceCents,
      compareAtPriceCents: v.compareAtPriceCents || undefined,
      inventoryQuantity: v.inventoryQuantity,
      barcode: v.barcode || undefined,
    })),
    mediaUrls: product.media.map((m) => m.url),
  };

  return <ProductForm initialData={initialData} />;
}

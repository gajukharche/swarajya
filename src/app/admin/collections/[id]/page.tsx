import { prisma } from '@/lib/prisma';
import { CollectionForm } from '@/components/admin/collection-form';
import { notFound } from 'next/navigation';
import { SmartCollectionRuleset } from '@/lib/collections/smart-rules';

export const dynamic = 'force-dynamic';

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [collection, products] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: { productId: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, handle: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const initialData = {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description || '',
    type: collection.type,
    rules: collection.rules ? (collection.rules as unknown as SmartCollectionRuleset) : undefined,
    productIds: collection.products.map((p) => p.productId),
  };

  return <CollectionForm initialData={initialData} availableProducts={products} />;
}

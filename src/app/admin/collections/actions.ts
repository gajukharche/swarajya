'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { evaluateSmartCollection, SmartCollectionRuleset } from '@/lib/collections/smart-rules';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { CollectionType } from '@prisma/client';

export interface CollectionFormData {
  id?: string;
  title: string;
  handle: string;
  description: string;
  type: CollectionType;
  rules?: SmartCollectionRuleset;
  productIds?: string[]; // For manual collection
}

export async function upsertCollectionAction(data: CollectionFormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const cleanHandle = data.handle.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
  let collectionId = data.id;

  await prisma.$transaction(async (tx) => {
    if (collectionId) {
      await tx.collection.update({
        where: { id: collectionId },
        data: {
          title: data.title,
          handle: cleanHandle,
          description: data.description,
          type: data.type,
          rules: data.type === 'SMART' && data.rules ? (data.rules as unknown as object) : undefined,
        },
      });
    } else {
      const created = await tx.collection.create({
        data: {
          title: data.title,
          handle: cleanHandle,
          description: data.description,
          type: data.type,
          rules: data.type === 'SMART' && data.rules ? (data.rules as unknown as object) : undefined,
        },
      });
      collectionId = created.id;
    }

    if (!collectionId) throw new Error('Collection ID not found');
    const finalCollectionId: string = collectionId;

    // If manual collection, associate selected products
    if (data.type === 'MANUAL' && data.productIds) {
      await tx.collectionProduct.deleteMany({ where: { collectionId: finalCollectionId } });
      await tx.collectionProduct.createMany({
        data: data.productIds.map((pId, idx) => ({
          collectionId: finalCollectionId,
          productId: pId,
          position: idx,
        })),
      });
    }
  });

  // If smart collection, execute AST rule evaluation immediately
  if (data.type === 'SMART' && collectionId) {
    await evaluateSmartCollection(collectionId);
  }

  try {
    revalidatePath('/admin/collections');
    revalidateTag(`collection:${cleanHandle}`, 'default');
    revalidateTag('catalog:all', 'default');
  } catch {}

  redirect('/admin/collections');
}

export async function deleteCollectionAction(collectionId: string, handle: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  await prisma.collection.delete({
    where: { id: collectionId },
  });

  try {
    revalidatePath('/admin/collections');
    revalidateTag(`collection:${handle}`, 'default');
  } catch {}
}

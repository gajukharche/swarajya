'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { DiscountType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDiscountAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const code = (formData.get('code') as string).toUpperCase().trim();
  const type = formData.get('type') as DiscountType;
  const rawValue = parseFloat(formData.get('value') as string || '0');
  const rawMin = parseFloat(formData.get('minSubtotal') as string || '0');
  const maxUses = parseInt(formData.get('maxUses') as string || '0', 10);

  // If percentage: value is raw number (e.g. 20). If fixed amount: store in integer cents.
  const value = type === 'PERCENTAGE' ? Math.round(rawValue) : Math.round(rawValue * 100);
  const minSubtotalCents = rawMin > 0 ? Math.round(rawMin * 100) : null;

  await prisma.discount.create({
    data: {
      code,
      type,
      value,
      minSubtotalCents,
      maxUses: maxUses > 0 ? maxUses : null,
      isActive: true,
    },
  });

  revalidatePath('/admin/discounts');
  redirect('/admin/discounts');
}

export async function toggleDiscountStatusAction(id: string, currentStatus: boolean) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.discount.update({
    where: { id },
    data: { isActive: !currentStatus },
  });

  revalidatePath('/admin/discounts');
}

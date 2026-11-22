import { prisma } from '@/lib/prisma';
import { DiscountType } from '@prisma/client';

export interface DiscountCalculationResult {
  valid: boolean;
  code?: string;
  type?: DiscountType;
  discountCents: number;
  freeShipping?: boolean;
  error?: string;
}

export async function evaluateDiscount(
  code: string,
  subtotalCents: number,
  customerId?: string
): Promise<DiscountCalculationResult> {
  const cleanCode = code.toUpperCase().trim();

  const discount = await prisma.discount.findUnique({
    where: { code: cleanCode },
  });

  if (!discount || !discount.isActive) {
    return { valid: false, discountCents: 0, error: 'Discount code does not exist or is inactive.' };
  }

  const now = new Date();
  if (discount.startsAt > now) {
    return { valid: false, discountCents: 0, error: 'Discount is not yet active.' };
  }

  if (discount.endsAt && discount.endsAt < now) {
    return { valid: false, discountCents: 0, error: 'Discount code has expired.' };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { valid: false, discountCents: 0, error: 'Discount code usage limit has been reached.' };
  }

  if (discount.minSubtotalCents && subtotalCents < discount.minSubtotalCents) {
    return {
      valid: false,
      discountCents: 0,
      error: `Minimum order amount of $${(discount.minSubtotalCents / 100).toFixed(2)} required.`,
    };
  }

  let discountCents = 0;
  let freeShipping = false;

  switch (discount.type) {
    case 'PERCENTAGE':
      // Value stored as percentage (e.g. 20 = 20%)
      discountCents = Math.round((subtotalCents * discount.value) / 100);
      break;

    case 'FIXED_AMOUNT':
      // Value stored in cents
      discountCents = Math.min(discount.value, subtotalCents);
      break;

    case 'FREE_SHIPPING':
      freeShipping = true;
      break;

    default:
      break;
  }

  return {
    valid: true,
    code: discount.code,
    type: discount.type,
    discountCents,
    freeShipping,
  };
}

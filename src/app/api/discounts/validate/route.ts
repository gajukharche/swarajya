import { NextResponse } from 'next/server';
import { evaluateDiscount } from '@/lib/discounts/calculator';
import { z } from 'zod';

const validateDiscountSchema = z.object({
  code: z.string().min(1),
  subtotalCents: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateDiscountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon format' }, { status: 400 });
    }

    const { code, subtotalCents } = parsed.data;
    const result = await evaluateDiscount(code, subtotalCents);

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Discount validation error:', err);
    return NextResponse.json({ valid: false, error: 'Failed to evaluate discount code.' }, { status: 500 });
  }
}

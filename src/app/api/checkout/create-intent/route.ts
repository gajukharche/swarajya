import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';
import { createInventoryReservation } from '@/lib/inventory/reservation-service';
import { z } from 'zod';

const createIntentSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  email: z.string().email(),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address1: z.string().min(1),
    city: z.string().min(1),
    province: z.string().optional(),
    zip: z.string().min(1),
    country: z.string().default('US'),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items, email, shippingAddress } = parsed.data;
    const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // 1. Concurrency-Safe Stock Reservation Hold (15 minutes)
    const reservation = await createInventoryReservation(checkoutId, items);

    if (!reservation.success) {
      return NextResponse.json(
        { error: reservation.error || 'Inventory hold could not be acquired.' },
        { status: 409 } // Conflict: out of stock
      );
    }

    // 2. Fetch authoritative prices from database (never trust client)
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    let subtotalCents = 0;
    for (const item of items) {
      const v = variants.find((variant) => variant.id === item.variantId);
      if (!v) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }
      subtotalCents += v.priceCents * item.quantity;
    }

    // Fixed standard shipping calculation
    const shippingCents = subtotalCents > 15000 ? 0 : 1200; // Free over $150
    const totalCents = subtotalCents + shippingCents;

    // 3. Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        checkoutId,
        customerEmail: email,
        shippingAddressJson: JSON.stringify(shippingAddress),
        itemsJson: JSON.stringify(items),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      checkoutId,
      subtotalCents,
      shippingCents,
      totalCents,
      expiresAt: reservation.expiresAt,
    });
  } catch (err: unknown) {
    console.error('Create PaymentIntent error:', err);
    return NextResponse.json(
      { error: 'Failed to initiate checkout process.' },
      { status: 500 }
    );
  }
}

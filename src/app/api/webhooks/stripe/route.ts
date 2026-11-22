import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';
import { commitInventoryReservation } from '@/lib/inventory/reservation-service';
import Stripe from 'stripe';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // 1. Strict Idempotency Check: Save event to ProcessedWebhookEvent table
  try {
    const existing = await prisma.processedWebhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existing) {
      // Event has already been processed cleanly, return 200 immediately
      return NextResponse.json({ received: true, deduplicated: true });
    }

    await prisma.processedWebhookEvent.create({
      data: {
        eventId: event.id,
        source: 'stripe',
        eventType: event.type,
      },
    });
  } catch {
    // Already inserted or concurrent duplicate
    return NextResponse.json({ received: true, deduplicated: true });
  }

  // 2. Handle payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const checkoutId = paymentIntent.metadata?.checkoutId;
    const customerEmail = paymentIntent.metadata?.customerEmail;
    const shippingAddress = JSON.parse(paymentIntent.metadata?.shippingAddressJson || '{}');
    const items = JSON.parse(paymentIntent.metadata?.itemsJson || '[]');

    if (checkoutId && customerEmail) {
      try {
        await prisma.$transaction(async (tx) => {
          // Create or link Customer
          const customer = await tx.customer.upsert({
            where: { email: customerEmail },
            update: {},
            create: {
              email: customerEmail,
              firstName: shippingAddress.firstName || '',
              lastName: shippingAddress.lastName || '',
            },
          });

          // Create immutable Order
          const order = await tx.order.create({
            data: {
              customerId: customer.id,
              email: customerEmail,
              status: 'PAID',
              currency: paymentIntent.currency,
              subtotalCents: paymentIntent.amount - 1200,
              shippingCents: 1200,
              totalCents: paymentIntent.amount,
              paymentIntentId: paymentIntent.id,
              shippingAddress,
              billingAddress: shippingAddress,
            },
          });

          // Create snapshot OrderItems
          for (const item of items) {
            const v = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: true },
            });

            if (v) {
              await tx.orderItem.create({
                data: {
                  orderId: order.id,
                  variantId: v.id,
                  title: v.product.title,
                  variantTitle: v.title,
                  sku: v.sku,
                  unitPriceCents: v.priceCents,
                  quantity: item.quantity,
                  totalCents: v.priceCents * item.quantity,
                },
              });
            }
          }

          // Record OrderEvent
          await tx.orderEvent.create({
            data: {
              orderId: order.id,
              type: 'PAYMENT_RECEIVED',
              message: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received via Stripe.`,
              data: { paymentIntentId: paymentIntent.id },
            },
          });
        });

        // 3. Commit inventory hold atomically
        await commitInventoryReservation(checkoutId);
      } catch (err) {
        console.error('Order creation error during webhook:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}

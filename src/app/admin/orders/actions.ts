'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { stripe } from '@/lib/stripe/server';
import { revalidatePath } from 'next/cache';

export async function fulfillOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const orderId = formData.get('orderId') as string;
  const carrier = (formData.get('carrier') as string) || 'USPS';
  const trackingNumber = (formData.get('trackingNumber') as string) || '';
  const trackingUrl = (formData.get('trackingUrl') as string) || '';

  if (!orderId) throw new Error('Order ID required');

  await prisma.$transaction(async (tx) => {
    // 1. Create Fulfillment Record
    await tx.fulfillment.create({
      data: {
        orderId,
        carrier,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        status: 'FULFILLED',
      },
    });

    // 2. Update Order Status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'FULFILLED' },
    });

    // 3. Log OrderEvent Timeline
    await tx.orderEvent.create({
      data: {
        orderId,
        type: 'ORDER_FULFILLED',
        message: `Fulfillment dispatched via ${carrier}. Tracking: ${trackingNumber || 'N/A'}.`,
        data: { carrier, trackingNumber, trackingUrl },
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
}

export async function refundOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const orderId = formData.get('orderId') as string;
  const amountCents = parseInt(formData.get('amountCents') as string, 10);
  const reason = (formData.get('reason') as string) || 'Customer request';
  const restock = formData.get('restock') === 'true';

  if (!orderId || isNaN(amountCents) || amountCents <= 0) {
    throw new Error('Invalid refund amount');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error('Order not found');

  let stripeRefundId = `sim_ref_${Date.now()}`;

  // Execute Stripe refund if paymentIntentId exists
  if (order.paymentIntentId && !order.paymentIntentId.startsWith('sim_')) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
        amount: amountCents,
        reason: 'requested_by_customer',
      });
      stripeRefundId = refund.id;
    } catch (err: unknown) {
      console.warn('Stripe refund notice:', err);
    }
  }

  await prisma.$transaction(async (tx) => {
    // 1. Record Refund
    await tx.refund.create({
      data: {
        orderId,
        amountCents,
        reason,
        stripeRefundId,
      },
    });

    // 2. Update Order Status
    const isFullRefund = amountCents >= order.totalCents;
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    // 3. Restock inventory if requested
    if (restock) {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              inventoryQuantity: { increment: item.quantity },
            },
          });
        }
      }
    }

    // 4. Log OrderEvent Timeline
    await tx.orderEvent.create({
      data: {
        orderId,
        type: 'ORDER_REFUNDED',
        message: `Refund of $${(amountCents / 100).toFixed(2)} issued. (${reason})${restock ? ' [Items Restocked]' : ''}`,
        data: { amountCents, reason, stripeRefundId, restock },
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
}

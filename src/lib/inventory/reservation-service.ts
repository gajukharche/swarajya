import { prisma } from '@/lib/prisma';

export interface HoldItemRequest {
  variantId: string;
  quantity: number;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  expiresAt?: Date;
  error?: string;
  unavailableVariantId?: string;
}

/**
 * Concurrency-safe inventory reservation engine.
 * Acquires row-level locks on requested ProductVariant rows via SELECT ... FOR UPDATE
 * to guarantee 0% overselling during concurrent checkouts.
 */
export async function createInventoryReservation(
  checkoutId: string,
  items: HoldItemRequest[]
): Promise<ReservationResult> {
  const HOLD_DURATION_MINUTES = 15;
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

  try {
    const reservationIds: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Raw row-level lock ensures atomic read-and-update under high concurrency
        const variants = await tx.$queryRaw<
          Array<{ id: string; inventory_quantity: number; reserved_quantity: number }>
        >`
          SELECT id, "inventoryQuantity" as inventory_quantity, "reservedQuantity" as reserved_quantity
          FROM "ProductVariant"
          WHERE id = ${item.variantId}
          FOR UPDATE
        `;

        if (variants.length === 0) {
          throw new Error(`Variant ${item.variantId} not found`);
        }

        const v = variants[0];
        const availableStock = v.inventory_quantity - v.reserved_quantity;

        if (availableStock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${item.variantId}`);
        }

        // Increment reservedQuantity
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            reservedQuantity: {
              increment: item.quantity,
            },
          },
        });

        // Insert reservation hold record
        const res = await tx.inventoryReservation.create({
          data: {
            variantId: item.variantId,
            checkoutId,
            quantity: item.quantity,
            expiresAt,
            status: 'PENDING',
          },
        });

        reservationIds.push(res.id);
      }
    });

    return {
      success: true,
      reservationId: checkoutId,
      expiresAt,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown reservation error';
    if (msg.startsWith('INSUFFICIENT_STOCK:')) {
      return {
        success: false,
        error: 'One or more items in your cart are no longer available.',
        unavailableVariantId: msg.split(':')[1],
      };
    }
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Commits a reservation upon successful Stripe payment finalization.
 * Atomically decrements actual inventoryQuantity and decrements reservedQuantity.
 */
export async function commitInventoryReservation(checkoutId: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { checkoutId, status: 'PENDING' },
      });

      for (const res of reservations) {
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: {
            inventoryQuantity: { decrement: res.quantity },
            reservedQuantity: { decrement: res.quantity },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'COMMITTED' },
        });
      }
    });

    return true;
  } catch (err) {
    console.error('Failed to commit inventory reservation:', err);
    return false;
  }
}

/**
 * Releases a pending reservation (e.g. if customer abandons or cancels checkout).
 */
export async function releaseInventoryReservation(checkoutId: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      const reservations = await tx.inventoryReservation.findMany({
        where: { checkoutId, status: 'PENDING' },
      });

      for (const res of reservations) {
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: {
            reservedQuantity: { decrement: res.quantity },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'CANCELLED' },
        });
      }
    });

    return true;
  } catch (err) {
    console.error('Failed to release inventory reservation:', err);
    return false;
  }
}

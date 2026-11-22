import { prisma } from '@/lib/prisma';

/**
 * Background sweep worker that reclaims expired inventory holds
 * where expiresAt < NOW() and status is still PENDING.
 */
export async function sweepExpiredInventoryReservations(): Promise<{ reclaimedCount: number }> {
  const now = new Date();
  let reclaimedCount = 0;

  try {
    await prisma.$transaction(async (tx) => {
      const expired = await tx.inventoryReservation.findMany({
        where: {
          expiresAt: { lt: now },
          status: 'PENDING',
        },
      });

      for (const res of expired) {
        await tx.productVariant.update({
          where: { id: res.variantId },
          data: {
            reservedQuantity: { decrement: res.quantity },
          },
        });

        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        reclaimedCount++;
      }
    });

    return { reclaimedCount };
  } catch (err) {
    console.error('Inventory sweep error:', err);
    return { reclaimedCount: 0 };
  }
}

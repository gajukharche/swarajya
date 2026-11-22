import { prisma } from '@/lib/prisma';

export async function getCartById(cartId: string) {
  return prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  media: { take: 1 },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function mergeGuestCartWithCustomer(cartId: string, customerId: string) {
  return prisma.cart.update({
    where: { id: cartId },
    data: { customerId },
  });
}

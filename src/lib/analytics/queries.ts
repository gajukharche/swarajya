import { prisma } from '@/lib/prisma';

export interface AnalyticsSummary {
  grossSalesCents: number;
  netSalesCents: number;
  totalRefundsCents: number;
  totalOrdersCount: number;
  averageOrderValueCents: number;
  totalCustomersCount: number;
  repeatCustomerRatePercentage: number;
  timeSeries: Array<{
    date: string;
    grossSalesCents: number;
    ordersCount: number;
  }>;
  topProducts: Array<{
    title: string;
    variantTitle: string | null;
    sku: string;
    unitsSold: number;
    revenueCents: number;
  }>;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const [orders, refunds, customers, orderItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { in: ['PAID', 'FULFILLED', 'REFUNDED', 'PARTIALLY_REFUNDED'] },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          totalCents: true,
          customerId: true,
          createdAt: true,
        },
      }),
      prisma.refund.findMany({
        select: {
          amountCents: true,
        },
      }),
      prisma.customer.findMany({
        select: {
          id: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
      prisma.orderItem.findMany({
        select: {
          title: true,
          variantTitle: true,
          sku: true,
          quantity: true,
          totalCents: true,
        },
      }),
    ]);

    const grossSalesCents = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const totalRefundsCents = refunds.reduce((sum, r) => sum + r.amountCents, 0);
    const netSalesCents = Math.max(0, grossSalesCents - totalRefundsCents);
    const totalOrdersCount = orders.length;
    const averageOrderValueCents = totalOrdersCount > 0 ? Math.round(grossSalesCents / totalOrdersCount) : 0;

    const totalCustomersCount = customers.length;
    const repeatCustomers = customers.filter((c) => c._count.orders > 1).length;
    const repeatCustomerRatePercentage =
      totalCustomersCount > 0 ? Math.round((repeatCustomers / totalCustomersCount) * 100) : 0;

    // Time-series generation (last 7 days grouping)
    const dayMap = new Map<string, { grossSalesCents: number; ordersCount: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap.set(dateKey, { grossSalesCents: 0, ordersCount: 0 });
    }

    orders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dayMap.has(dateKey)) {
        const curr = dayMap.get(dateKey)!;
        curr.grossSalesCents += o.totalCents;
        curr.ordersCount += 1;
      }
    });

    const timeSeries = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      grossSalesCents: data.grossSalesCents,
      ordersCount: data.ordersCount,
    }));

    // Group order items by SKU / title to find top sellers
    const itemMap = new Map<
      string,
      {
        title: string;
        variantTitle: string | null;
        sku: string;
        unitsSold: number;
        revenueCents: number;
      }
    >();

    orderItems.forEach((item) => {
      const key = item.sku || item.title;
      const existing = itemMap.get(key);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenueCents += item.totalCents;
      } else {
        itemMap.set(key, {
          title: item.title,
          variantTitle: item.variantTitle,
          sku: item.sku,
          unitsSold: item.quantity,
          revenueCents: item.totalCents,
        });
      }
    });

    const topProducts = Array.from(itemMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      grossSalesCents,
      netSalesCents,
      totalRefundsCents,
      totalOrdersCount,
      averageOrderValueCents,
      totalCustomersCount,
      repeatCustomerRatePercentage,
      timeSeries,
      topProducts,
    };
  } catch {
    // Return sample empty structure when database is not active
    return {
      grossSalesCents: 0,
      netSalesCents: 0,
      totalRefundsCents: 0,
      totalOrdersCount: 0,
      averageOrderValueCents: 0,
      totalCustomersCount: 0,
      repeatCustomerRatePercentage: 0,
      timeSeries: [
        { date: 'Mon', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Tue', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Wed', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Thu', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Fri', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Sat', grossSalesCents: 0, ordersCount: 0 },
        { date: 'Sun', grossSalesCents: 0, ordersCount: 0 },
      ],
      topProducts: [],
    };
  }
}

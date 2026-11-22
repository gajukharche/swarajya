import { NextResponse } from 'next/server';
import { sweepExpiredInventoryReservations } from '@/lib/jobs/inventory-sweep';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Authorization check for scheduled cron jobs (e.g. Vercel Cron or GitHub Actions)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await sweepExpiredInventoryReservations();

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...result,
  });
}

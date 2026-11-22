import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createPresignedUploadUrl } from '@/lib/storage/r2';
import { z } from 'zod';

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
  ]),
  sizeBytes: z.number().max(100 * 1024 * 1024), // Max 100MB
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = presignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { filename, contentType } = parsed.data;
    const presignData = await createPresignedUploadUrl(filename, contentType);

    return NextResponse.json(presignData);
  } catch (error: unknown) {
    console.error('Presign endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned upload URL' },
      { status: 500 }
    );
  }
}

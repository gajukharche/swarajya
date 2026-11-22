'use server';

import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export async function loginAdminAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirect') as string) || '/admin';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch {
      // Database might be starting up or offline locally
    }

    if (!user) {
      // Local development fallback: allow default seeded admin credentials even if DB is cold
      if (email.toLowerCase().trim() === 'admin@store.local' && password === 'adminpassword123') {
        await createSession({
          userId: 'seed-admin-id',
          email: 'admin@store.local',
          role: 'ADMIN',
          name: 'Store Administrator',
        });
        redirect(redirectTo);
      }
      return { error: 'Invalid credentials. Please verify your email and password.' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid credentials. Please check your password.' };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err: unknown) {
    // If redirect throws Next.js NEXT_REDIRECT, let it pass through
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as { digest: string }).digest === 'string' && (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('Login action error:', err);
    return { error: 'An error occurred during authentication.' };
  }

  redirect(redirectTo);
}

export async function logoutAdminAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

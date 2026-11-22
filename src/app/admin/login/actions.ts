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
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { error: 'Invalid credentials.' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid credentials.' };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (err: unknown) {
    console.error('Login action error:', err);
    return { error: 'An error occurred during authentication.' };
  }

  redirect(redirectTo);
}

export async function logoutAdminAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

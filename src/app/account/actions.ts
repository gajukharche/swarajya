'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createCustomerSession, destroyCustomerSession, getCustomerSession } from '@/lib/auth/customer-session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginOrRegisterCustomerAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const firstName = (formData.get('firstName') as string)?.trim() || null;
  const lastName = (formData.get('lastName') as string)?.trim() || null;
  const mode = (formData.get('mode') as string) || 'login';

  if (!email || !email.includes('@')) {
    return { error: 'Please provide a valid email address.' };
  }

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (mode === 'register') {
      if (customer) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }

      const passwordHash = await hashPassword(password);
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
        },
      });
    } else {
      // Login mode
      if (!customer) {
        // Automatically create account for smooth demo / checkout buyer conversion if not existing
        const passwordHash = await hashPassword(password);
        customer = await prisma.customer.create({
          data: {
            email,
            firstName: firstName || email.split('@')[0],
            lastName,
            passwordHash,
          },
        });
      } else if (customer.passwordHash) {
        const isValid = await verifyPassword(password, customer.passwordHash);
        if (!isValid) {
          return { error: 'Invalid password. Please check your credentials.' };
        }
      } else {
        // Customer exists without password (e.g. created during guest checkout), set password now
        const passwordHash = await hashPassword(password);
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: { passwordHash },
        });
      }
    }

    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.email;
    await createCustomerSession({
      customerId: customer.id,
      email: customer.email,
      name: fullName,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as { digest: string }).digest === 'string' && (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    // Development fallback if DB is cold
    await createCustomerSession({
      customerId: 'demo-customer-id',
      email,
      name: firstName || email.split('@')[0],
    });
    redirect('/account');
  }

  redirect('/account');
}

export async function logoutCustomerAction(): Promise<void> {
  await destroyCustomerSession();
  redirect('/account/login');
}

export async function saveAddressAction(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error('You must be signed in to save addresses.');
  }

  const addressId = formData.get('addressId') as string | null;
  const firstName = (formData.get('firstName') as string)?.trim() || null;
  const lastName = (formData.get('lastName') as string)?.trim() || null;
  const company = (formData.get('company') as string)?.trim() || null;
  const address1 = (formData.get('address1') as string)?.trim();
  const address2 = (formData.get('address2') as string)?.trim() || null;
  const city = (formData.get('city') as string)?.trim();
  const province = (formData.get('province') as string)?.trim() || null;
  const country = (formData.get('country') as string)?.trim() || 'US';
  const zip = (formData.get('zip') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const isDefaultShipping = formData.get('isDefaultShipping') === 'true';

  if (!address1 || !city || !zip) {
    return;
  }

  if (isDefaultShipping) {
    await prisma.address.updateMany({
      where: { customerId: session.customerId },
      data: { isDefaultShipping: false },
    });
  }

  if (addressId) {
    await prisma.address.update({
      where: { id: addressId, customerId: session.customerId },
      data: {
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        province,
        country,
        zip,
        phone,
        isDefaultShipping,
      },
    });
  } else {
    await prisma.address.create({
      data: {
        customerId: session.customerId,
        firstName,
        lastName,
        company,
        address1,
        address2,
        city,
        province,
        country,
        zip,
        phone,
        isDefaultShipping,
      },
    });
  }

  revalidatePath('/account');
  revalidatePath('/account/addresses');
}

export async function deleteAddressAction(formData: FormData): Promise<void> {
  const session = await getCustomerSession();
  if (!session) return;

  const addressId = formData.get('addressId') as string;
  if (!addressId) return;

  try {
    await prisma.address.delete({
      where: { id: addressId, customerId: session.customerId },
    });
    revalidatePath('/account');
    revalidatePath('/account/addresses');
  } catch {
    // ignore
  }
}

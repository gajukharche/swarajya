import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const CUSTOMER_SESSION_COOKIE = 'customer_session_token';
const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback_secret_32_characters_minimum_string_for_testing';
const secretKey = new TextEncoder().encode(AUTH_SECRET);

export interface CustomerSessionPayload {
  customerId: string;
  email: string;
  name?: string | null;
}

export async function createCustomerSession(payload: CustomerSessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return token;
}

export async function verifyCustomerSession(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as CustomerSessionPayload;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSession(token);
}

export async function destroyCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

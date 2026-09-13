import 'server-only';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type UserRole = 'USER' | 'ADMIN';

export interface TokenPayloadShop {
  id: string;
  name: string;
  description: string | null;
  shop_logo: string | null;
  marketplace: string;
  authorization_expiration: string | null;
  authorized_in: string | null;
  status: string;
  invoice_issuer: string | null;
  region: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_email_verified: boolean;
  shop?: TokenPayloadShop | null;
  iat?: number;
  exp?: number;
}

export const AUTH_COOKIE = 'user_auth_token';
export const SHOP_ID_COOKIE = 'shop_id';

const jwtSecret = process.env.JWT_SECRET;
const encodedKey = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value;
}

export async function storeShopId(shopId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SHOP_ID_COOKIE, shopId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getShopIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SHOP_ID_COOKIE)?.value ?? null;
}

export async function verifyAuthToken(
  token: string | undefined,
): Promise<TokenPayload | null> {
  if (!token || !encodedKey) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

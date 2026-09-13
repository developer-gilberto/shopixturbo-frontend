import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import {
  getTokenFromCookie,
  type TokenPayload,
  verifyAuthToken,
} from '@/lib/session';

export interface SessionUser extends TokenPayload {}

export const verifySession = cache(async () => {
  const token = await getTokenFromCookie();
  const user = await verifyAuthToken(token);

  if (!user) {
    redirect('/');
  }

  return { isAuth: true, user } as const;
});

export type VerifySessionResult = Awaited<ReturnType<typeof verifySession>>;

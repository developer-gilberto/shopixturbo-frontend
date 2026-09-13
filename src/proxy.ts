import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/session';

const PRIVATE_PATHS = ['/dashboard', '/products', '/orders', '/my-account'];
const PUBLIC_PATHS = ['/signup'];

function matchesPath(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(AUTH_COOKIE);

  // Página inicial (login), signup e verificação são públicas
  const isPublicRoute =
    pathname === '/' ||
    PUBLIC_PATHS.some((route) => matchesPath(pathname, route));

  const isShopeeCallback =
    pathname === '/' &&
    request.nextUrl.searchParams.has('code') &&
    request.nextUrl.searchParams.has('shop_id');

  if (isPublicRoute && isAuthenticated && !isShopeeCallback) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isPrivateRoute = PRIVATE_PATHS.some((route) =>
    matchesPath(pathname, route),
  );

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)',
  ],
};

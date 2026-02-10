// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Daftar path yang tidak memerlukan autentikasi
const publicPaths = ['/', '/login', '/api/auth/login', '/api/setup', '/setup'];

export function middleware(request: NextRequest) {
  // Jika path adalah publik, lanjutkan tanpa autentikasi
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Periksa token di localStorage via cookie (client-side) atau header
  const token = request.cookies.get('auth_token')?.value || request.headers.get('Authorization');

  // Jika tidak ada token, redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika semua lolos, lanjutkan ke halaman
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Daftar path yang tidak memerlukan autentikasi (client routes)
const publicClientPaths = ['/', '/login', '/api/auth/login'];

// Routes yang memerlukan autentikasi admin
const protectedAdminRoutes = ['/admin'];
const adminApiRoutes = ['/api/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Jika path adalah publik untuk client, lanjutkan tanpa autentikasi
  if (publicClientPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if it's a protected admin route
  const isAdminRoute = protectedAdminRoutes.some(route => pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute || isAdminApiRoute) {
    // Skip auth check untuk login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Get admin token dari cookies
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!adminToken) {
      // Redirect ke login untuk pages, return 401 untuk API
      if (isAdminRoute) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    try {
      const secret = process.env.ADMIN_JWT_SECRET;

      if (!secret) {
        return NextResponse.json(
          { success: false, error: 'ADMIN_JWT_SECRET is not configured' },
          { status: 500 }
        );
      }

      const { payload } = await jwtVerify(
        adminToken,
        new TextEncoder().encode(secret)
      );

      // Verify role
      if (payload.role !== 'admin') {
        if (isAdminRoute) {
          return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } catch {
      // Invalid token
      const response = isAdminApiRoute
        ? NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', request.url));

      response.cookies.set('admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      return response;
    }
  }

  // Untuk route lain (non-admin), cek client auth token
  const clientToken = request.cookies.get('auth_token')?.value || request.headers.get('Authorization');

  if (!clientToken) {
    // Redirect ke login untuk page routes
    if (!isAdminRoute && !isAdminApiRoute && !pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    const secret = process.env.CLIENT_JWT_SECRET;

    if (secret) {
      try {
        await jwtVerify(
          clientToken.startsWith('Bearer ') ? clientToken.slice(7) : clientToken,
          new TextEncoder().encode(secret)
        );
      } catch {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

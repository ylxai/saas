// app/api/auth/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES, seedAdminUser } from '@/lib/db';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    // Seed admin user first to ensure it exists
    await seedAdminUser();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    // Get admin user from database
    const { rows } = await query(
      `SELECT id, username, password_hash FROM ${TABLES.ADMIN_USERS} WHERE username = $1`,
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const admin = rows[0];

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const secret = process.env.ADMIN_JWT_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'ADMIN_JWT_SECRET is not configured' },
        { status: 500 }
      );
    }

    // Create JWT token
    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT({
      id: admin.id,
      username: admin.username,
      role: 'admin'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          role: 'admin'
        }
      }
    });

    // Set admin token cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

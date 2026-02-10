// app/api/auth/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES, seedAdminUser } from '@/lib/db';

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

    // Create token (simple base64 for demo - in production use JWT)
    const token = Buffer.from(JSON.stringify({
      id: admin.id,
      username: admin.username,
      role: 'admin',
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })).toString('base64');

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

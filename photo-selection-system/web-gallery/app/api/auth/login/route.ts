// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';
import { query, TABLES } from '@/lib/db';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`login:${clientId}`, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many login attempts. Please try again later.',
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      });
    }
    const body = await request.json();
    const { username, password } = body;

    // Validasi input sederhana
    if (!username || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Username and password are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verifikasi kredensial dengan database
    const { rows } = await query(
      `SELECT id, name, username, password_hash FROM ${TABLES.CLIENTS} WHERE username = $1`,
      [username]
    );

    const client = rows[0];

    if (!client) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Verifikasi password
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, client.password_hash);

    if (!isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const secret = process.env.CLIENT_JWT_SECRET;

    if (!secret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'CLIENT_JWT_SECRET is not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Buat JWT token untuk client
    const token = await new SignJWT({
      id: client.id,
      username: client.username,
      role: 'client'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(secret));
    
    const response = new Response(JSON.stringify({ 
      success: true, 
      message: 'Login successful',
      token,
      client: {
        id: client.id,
        name: client.name,
        username: client.username,
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    response.headers.append(
      'Set-Cookie',
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process login request' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

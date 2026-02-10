// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/db';
import { randomUUID } from 'crypto';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';

// GET - List all clients
export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin:clients:get:${clientId}`, {
      maxRequests: 60,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = `SELECT id, name, username, api_key, created_at FROM ${TABLES.CLIENTS}`;
    const params: string[] = [];

    if (search) {
      sql += ` WHERE name ILIKE $1 OR username ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const { rows } = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: { clients: rows }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data client' },
      { status: 500 }
    );
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin:clients:post:${clientId}`, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { name, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, username, dan password diperlukan' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = `sk_${randomUUID().replace(/-/g, '')}`;

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await query(
      `INSERT INTO ${TABLES.CLIENTS} (name, username, password_hash, email, api_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, username, api_key, created_at`,
      [name, username, passwordHash, null, apiKey]
    );

    return NextResponse.json({
      success: true,
      data: { client: rows[0] }
    });
  } catch (error: unknown) {
    console.error('Error creating client:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal membuat client' },
      { status: 500 }
    );
  }
}

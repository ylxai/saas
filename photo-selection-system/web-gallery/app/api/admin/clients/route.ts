// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List all clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = `SELECT id, name, email, api_key, created_at FROM ${TABLES.CLIENTS}`;
    const params: string[] = [];

    if (search) {
      sql += ` WHERE name ILIKE $1 OR email ILIKE $1`;
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
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name dan email diperlukan' },
        { status: 400 }
      );
    }

    // Generate API key
    const apiKey = `sk_${randomUUID().replace(/-/g, '')}`;

    const { rows } = await query(
      `INSERT INTO ${TABLES.CLIENTS} (name, email, api_key)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, api_key, created_at`,
      [name, email, apiKey]
    );

    return NextResponse.json({
      success: true,
      data: { client: rows[0] }
    });
  } catch (error: unknown) {
    console.error('Error creating client:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal membuat client' },
      { status: 500 }
    );
  }
}

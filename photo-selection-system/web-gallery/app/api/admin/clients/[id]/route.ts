// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/db';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';

// PUT - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin:clients:put:${clientId}`, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }
    const { id } = await params;
    const body = await request.json();
    const { name, username, password } = body;

    if (!name || !username) {
      return NextResponse.json(
        { success: false, error: 'Name dan username diperlukan' },
        { status: 400 }
      );
    }

    let updateSql = `UPDATE ${TABLES.CLIENTS}
       SET name = $1, username = $2`;
    const queryParams: (string | null)[] = [name, username];

    if (password) {
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 10);
      updateSql += `, password_hash = $3`;
      queryParams.push(passwordHash);
    }

    updateSql += ` WHERE id = $${queryParams.length + 1}
       RETURNING id, name, username, api_key, created_at`;
    queryParams.push(id);

    const { rows } = await query(updateSql, queryParams);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Client tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { client: rows[0] }
    });
  } catch (error: unknown) {
    console.error('Error updating client:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate client' },
      { status: 500 }
    );
  }
}

// DELETE - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin:clients:delete:${clientId}`, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }
    const { id } = await params;

    const { rowCount } = await query(
      `DELETE FROM ${TABLES.CLIENTS} WHERE id = $1`,
      [id]
    );

    if (rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Client tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Client berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus client' },
      { status: 500 }
    );
  }
}

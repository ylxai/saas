// app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, TABLES } from '@/lib/db';

// PUT - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name dan email diperlukan' },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `UPDATE ${TABLES.CLIENTS}
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING id, name, email, api_key, created_at`,
      [name, email, id]
    );

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
        { success: false, error: 'Email sudah digunakan' },
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

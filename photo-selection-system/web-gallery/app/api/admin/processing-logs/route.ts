// app/api/admin/processing-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`admin:logs:get:${clientId}`, {
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
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 200);
    const status = searchParams.get('status');

    let sql = `
      SELECT pl.id, pl.file_id, pl.action, pl.timestamp, pl.status, pl.details,
             f.filename, e.name as event_name
      FROM processing_log pl
      LEFT JOIN files f ON f.id = pl.file_id
      LEFT JOIN events e ON e.id = f.event_id
    `;

    const params: (string | number)[] = [];

    if (status) {
      sql += ` WHERE pl.status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY pl.timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const { rows } = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: { logs: rows }
    });
  } catch (error) {
    console.error('Error fetching processing logs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil processing logs' },
      { status: 500 }
    );
  }
}

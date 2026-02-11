// app/api/admin/ably-token/route.ts
import { NextResponse } from 'next/server';
import Ably from 'ably';

export async function POST() {
  try {
    const apiKey = process.env.ABLY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ABLY_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const client = new Ably.Rest({ key: apiKey });
    const tokenRequest = await client.auth.createTokenRequest({ clientId: 'admin' });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error('Error creating Ably token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Ably token' },
      { status: 500 }
    );
  }
}

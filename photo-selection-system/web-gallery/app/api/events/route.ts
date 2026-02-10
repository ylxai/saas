// app/api/events/route.ts
import { NextRequest } from 'next/server';
import { getEventsByClientId } from '@/lib/fileService';
import { verifyClientToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const client = await verifyClientToken(request);

    if (!client) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Ambil events dari database
    const events = await getEventsByClientId(client.id);
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: { events } 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch events' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

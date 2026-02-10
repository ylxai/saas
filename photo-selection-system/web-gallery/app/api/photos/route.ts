// app/api/photos/route.ts
import { NextRequest } from 'next/server';
import { getFilesByEventId } from '@/lib/fileService';

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');
    
    if (!eventId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Event ID is required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Ambil photos dari database
    const photos = await getFilesByEventId(eventId);

    return new Response(JSON.stringify({ 
      success: true, 
      data: { photos } 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to fetch photos' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
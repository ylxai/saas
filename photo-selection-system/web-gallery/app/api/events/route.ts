// app/api/events/route.ts
import { NextRequest } from 'next/server';
import { getAllEvents } from '@/lib/fileService';

export async function GET() {
  try {
    // Ambil events dari database
    const events = await getAllEvents();
    
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
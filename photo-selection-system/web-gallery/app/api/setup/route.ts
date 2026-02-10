// app/api/setup/route.ts
import { NextRequest } from 'next/server';
import { initializeSchema } from '@/lib/db';

export async function GET() {
  try {
    // Inisialisasi skema database
    await initializeSchema();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Database schema initialized successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to initialize database schema' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
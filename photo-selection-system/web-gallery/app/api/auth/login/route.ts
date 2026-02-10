// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { Client } from '@/types';
import { validateClient } from '@/utils/validation';

// Mock data untuk contoh
const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    apiKey: 'api-key-1',
    createdAt: new Date(),
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    apiKey: 'api-key-2',
    createdAt: new Date(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validasi input sederhana
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Dalam implementasi sebenarnya, ini akan memverifikasi kredensial dengan database
    // Untuk contoh, kita hanya akan mencocokkan email
    const client = mockClients.find(c => c.email === email);
    
    if (!client) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid credentials' 
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Dalam implementasi sebenarnya, Anda akan membuat token JWT di sini
    const token = `mock-token-${client.id}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Login successful',
      token,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process login request' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { Client } from '@/types';
import { validateClient } from '@/utils/validation';

// Mock data untuk contoh dengan password hash
const mockClients: Array<Client & { passwordHash: string }> = [
  {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    apiKey: 'api-key-1',
    createdAt: new Date(),
    passwordHash: 'password123', // TODO: Use bcrypt hash in production
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    apiKey: 'api-key-2',
    createdAt: new Date(),
    passwordHash: 'password456', // TODO: Use bcrypt hash in production
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

    // Verifikasi kredensial dengan database/mock data
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

    // Verifikasi password (dalam produksi gunakan bcrypt.compare)
    if (password !== client.passwordHash) {
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
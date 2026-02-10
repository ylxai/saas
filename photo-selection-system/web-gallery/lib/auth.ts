// lib/auth.ts
import { jwtVerify } from 'jose';

export interface ClientTokenPayload {
  id: string;
  username: string;
  role: 'client';
}

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function verifyClientToken(request: Request): Promise<ClientTokenPayload | null> {
  const cookieToken = request.headers.get('cookie')?.match(/auth_token=([^;]+)/)?.[1] || null;
  const headerToken = getBearerToken(request.headers.get('authorization'));
  const token = cookieToken || headerToken;

  if (!token) return null;

  const secret = process.env.CLIENT_JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (payload.role !== 'client') return null;
    if (typeof payload.id !== 'string' || typeof payload.username !== 'string') return null;

    return {
      id: payload.id,
      username: payload.username,
      role: 'client',
    };
  } catch {
    return null;
  }
}

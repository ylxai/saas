// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { uploadPhotoToStorage } from '@/lib/fileService';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 uploads per 15 minutes per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`upload:${clientId}`, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      });
    }
    // Dalam implementasi sebenarnya, kita akan menerima file dari form data
    // Untuk contoh ini, kita akan mensimulasikannya
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const eventId = formData.get('eventId') as string | null;
    const fileType = formData.get('fileType') as string | null;

    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file uploaded' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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

    if (!fileType || !['RAW', 'JPG', 'OTHER'].includes(fileType)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Valid file type is required (RAW, JPG, OTHER)' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file ke storage dan simpan ke database
    const result = await uploadPhotoToStorage(
      buffer,
      file.name,
      eventId,
      fileType as 'RAW' | 'JPG' | 'OTHER'
    );

    if (!result) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to upload file' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'File uploaded successfully',
      data: { file: result }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to process upload request' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
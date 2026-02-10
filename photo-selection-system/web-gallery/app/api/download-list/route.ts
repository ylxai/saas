// app/api/download-list/route.ts
import { NextRequest } from 'next/server';
import { getSelectedFilesByClientId } from '@/lib/fileService';

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');
    
    if (!clientId) {
      return new Response('Client ID is required', {
        status: 400,
      });
    }

    // Ambil file-file yang dipilih oleh klien
    const selectedFiles = await getSelectedFilesByClientId(clientId);

    if (selectedFiles.length === 0) {
      return new Response('No selected files found for this client', {
        status: 404,
      });
    }

    // Buat konten file .txt
    const fileContent = selectedFiles
      .map(file => file.filename)
      .join('\n');

    // Kembalikan sebagai file teks
    return new Response(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="selected_photos_${clientId}.txt"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating photo list:', error);
    return new Response('Failed to generate photo list', {
      status: 500,
    });
  }
}
// app/api/export/route.ts
import { NextRequest } from 'next/server';
import { updateFileSelectionStatus, getSelectedFilesByClientId } from '@/lib/fileService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoIds, clientId } = body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid photo IDs provided' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!clientId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Client ID is required' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Update status seleksi untuk setiap foto
    const updatePromises = photoIds.map(photoId => 
      updateFileSelectionStatus(photoId, true)
    );
    
    const results = await Promise.all(updatePromises);
    const successfulUpdates = results.filter(result => result).length;

    // Ambil file-file yang dipilih untuk membuat daftar
    const selectedFiles = await getSelectedFilesByClientId(clientId);

    // Dalam implementasi sebenarnya, Anda mungkin ingin:
    // 1. Membuat file .txt dengan daftar nama file
    // 2. Mengirim notifikasi ke aplikasi desktop
    // 3. Mencatat aktivitas ke log
    
    // Simulasi pembuatan daftar file
    const fileList = selectedFiles.map(file => file.filename).join('\n');
    
    // Di sini Anda bisa menyimpan daftar ke storage atau database
    console.log(`Exported ${successfulUpdates} photos for client ${clientId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${successfulUpdates} photos exported successfully`,
      data: { 
        exportedCount: successfulUpdates, 
        photoIds,
        fileList // Ini bisa digunakan untuk membuat file .txt
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error exporting selection:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to export selection' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
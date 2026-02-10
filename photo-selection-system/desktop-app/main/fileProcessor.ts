// main/fileProcessor.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { getDatabaseClient } from './database';
import * as log from 'electron-log';

interface PhotoFile {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  isSelected: boolean;
  fileType: 'RAW' | 'JPG' | 'OTHER';
  eventId: string;
  createdAt: string;
  updatedAt: string;
}

interface Selection {
  id: string;
  fileId: string;
  clientId: string;
  selectedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function setupFileProcessing() {
  log.info('File processing service initialized');
}

export async function getSelectedPhotosForProcessing(): Promise<PhotoFile[]> {
  try {
    const sql = getDatabaseClient();
    
    // Query untuk mendapatkan file-file yang dipilih oleh klien
    const query = `
      SELECT f.* 
      FROM files f
      JOIN selections s ON f.id = s.file_id
      WHERE s.status = 'pending' AND f.is_selected = true
      ORDER BY f.created_at ASC
    `;
    
    const result = await sql(query);
    log.info(`Found ${result.length} photos to process`);
    
    return result as PhotoFile[];
  } catch (error) {
    log.error('Error fetching selected photos:', error);
    throw error;
  }
}

export async function updateSelectionStatus(selectionId: string, status: Selection['status']) {
  try {
    const sql = getDatabaseClient();
    
    const query = `
      UPDATE selections 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    
    await sql(query, [status, selectionId]);
    log.info(`Updated selection ${selectionId} to status: ${status}`);
  } catch (error) {
    log.error(`Error updating selection status for ${selectionId}:`, error);
    throw error;
  }
}

export async function copyRawFilesToEditedFolder(
  sourceFolderPath: string, 
  targetFolderPath: string, 
  photoFiles: PhotoFile[]
): Promise<string[]> {
  try {
    // Buat folder target jika belum ada
    await fs.mkdir(targetFolderPath, { recursive: true });
    
    const copiedFiles: string[] = [];
    
    for (const photo of photoFiles) {
      // Cari file RAW yang sesuai berdasarkan nama file
      // Misalnya jika photo.filename adalah "IMG_0001.jpg", maka RAW-nya mungkin "IMG_0001.RAW" atau "IMG_0001.CR2"
      const rawExtensions = ['.raw', '.cr2', '.nef', '.orf', '.arw', '.dng', '.raf', '.rw2'];
      let sourceFilePath: string | null = null;
      
      for (const ext of rawExtensions) {
        // Ambil nama file tanpa ekstensi dan tambahkan ekstensi RAW
        const baseName = path.basename(photo.filename, path.extname(photo.filename));
        const rawFileName = baseName + ext;
        const fullPath = path.join(sourceFolderPath, rawFileName);
        
        try {
          await fs.access(fullPath);
          sourceFilePath = fullPath;
          break;
        } catch {
          // File tidak ditemukan, coba ekstensi berikutnya
          continue;
        }
      }
      
      if (sourceFilePath) {
        // Salin file RAW ke folder target
        const targetFilePath = path.join(targetFolderPath, path.basename(sourceFilePath));
        await fs.copyFile(sourceFilePath, targetFilePath);
        
        copiedFiles.push(targetFilePath);
        log.info(`Copied ${sourceFilePath} to ${targetFilePath}`);
      } else {
        log.warn(`RAW file not found for ${photo.filename}`);
      }
    }
    
    return copiedFiles;
  } catch (error) {
    log.error('Error copying RAW files:', error);
    throw error;
  }
}

export async function processSelectedPhotos(
  sourceFolderPath: string,
  targetFolderPath: string
): Promise<{ success: boolean; processedCount: number; errors: string[] }> {
  try {
    log.info('Starting photo processing...');
    
    // Dapatkan file-file yang dipilih untuk diproses
    const selectedPhotos = await getSelectedPhotosForProcessing();
    
    if (selectedPhotos.length === 0) {
      log.info('No photos to process');
      return { success: true, processedCount: 0, errors: [] };
    }
    
    // Salin file RAW ke folder target
    const copiedFiles = await copyRawFilesToEditedFolder(
      sourceFolderPath,
      targetFolderPath,
      selectedPhotos
    );
    
    // Update status di database
    // Dalam implementasi sebenarnya, kita juga perlu mengupdate status selection
    // berdasarkan file yang berhasil diproses
    
    log.info(`Successfully processed ${copiedFiles.length} photos`);
    
    return { 
      success: true, 
      processedCount: copiedFiles.length, 
      errors: [] 
    };
  } catch (error) {
    log.error('Error processing selected photos:', error);
    return { 
      success: false, 
      processedCount: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'] 
    };
  }
}
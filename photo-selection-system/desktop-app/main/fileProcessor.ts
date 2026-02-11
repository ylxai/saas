// main/fileProcessor.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { getDatabaseClient } from './database';
import * as log from 'electron-log';
import { publishProcessingUpdate } from './realtimePublisher';

interface PhotoFile {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  isSelected: boolean;
  fileType: 'RAW' | 'JPG' | 'OTHER';
  eventId: string;
  selectionId: string;
  clientId: string;
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
      SELECT f.*, s.id as "selectionId", s.client_id as "clientId"
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
      SET status = $1
      WHERE id = $2
    `;
    
    await sql(query, [status, selectionId]);
    log.info(`Updated selection ${selectionId} to status: ${status}`);
  } catch (error) {
    log.error(`Error updating selection status for ${selectionId}:`, error);
    throw error;
  }
}

async function createProcessingLog(fileId: string, status: 'success' | 'failed', details?: string) {
  const sql = getDatabaseClient();

  const query = `
    INSERT INTO processing_log (file_id, action, status, details)
    VALUES ($1, 'copy', $2, $3)
  `;

  await sql(query, [fileId, status, details || null]);

  await publishProcessingUpdate({
    fileId,
    action: 'copy',
    status,
    details: details || null,
    timestamp: new Date().toISOString(),
  });
}

const RAW_EXTENSIONS = ['.raw', '.cr2', '.nef', '.orf', '.arw', '.dng', '.raf', '.rw2'];
const STRIP_SUFFIXES = ['_edited', '-edited', '_edit', '-edit', '_small', '-small', '_preview', '-preview', '_jpg', '-jpg'];

function normalizeBaseName(fileName: string): string {
  let base = path.basename(fileName, path.extname(fileName)).toLowerCase();

  for (const suffix of STRIP_SUFFIXES) {
    if (base.endsWith(suffix)) {
      base = base.slice(0, -suffix.length);
    }
  }

  return base;
}

async function listRawFiles(folderPath: string): Promise<string[]> {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await listRawFiles(fullPath);
      results.push(...nested);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (RAW_EXTENSIONS.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

async function buildRawIndex(sourceFolderPath: string): Promise<Map<string, string[]>> {
  const rawFiles = await listRawFiles(sourceFolderPath);
  const index = new Map<string, string[]>();

  for (const filePath of rawFiles) {
    const base = normalizeBaseName(filePath);
    const list = index.get(base) || [];
    list.push(filePath);
    index.set(base, list);
  }

  return index;
}

function pickRawCandidate(candidates: string[]): string {
  const priority = RAW_EXTENSIONS;
  const sorted = [...candidates].sort((a, b) => {
    const extA = path.extname(a).toLowerCase();
    const extB = path.extname(b).toLowerCase();
    return priority.indexOf(extA) - priority.indexOf(extB);
  });

  return sorted[0];
}

async function copyWithRetry(sourcePath: string, targetPath: string, attempts = 3): Promise<void> {
  let lastError: unknown;

  for (let i = 1; i <= attempts; i++) {
    try {
      await fs.copyFile(sourcePath, targetPath);
      return;
    } catch (error) {
      lastError = error;
      const delay = 200 * i;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function copyRawFilesToEditedFolder(
  sourceFolderPath: string, 
  targetFolderPath: string, 
  photoFiles: PhotoFile[]
): Promise<string[]> {
  try {
    // Buat folder target jika belum ada
    await fs.mkdir(targetFolderPath, { recursive: true });

    const rawIndex = await buildRawIndex(sourceFolderPath);
    
    const copiedFiles: string[] = [];
    
    for (const photo of photoFiles) {
      const baseName = normalizeBaseName(photo.filename);
      const candidates = rawIndex.get(baseName);

      if (!candidates || candidates.length === 0) {
        log.warn(`RAW file not found for ${photo.filename}`);
        await updateSelectionStatus(photo.selectionId, 'failed');
        await createProcessingLog(photo.id, 'failed', 'RAW file not found');
        continue;
      }

      const sourceFilePath = pickRawCandidate(candidates);
      const targetFilePath = path.join(targetFolderPath, path.basename(sourceFilePath));

      try {
        await updateSelectionStatus(photo.selectionId, 'processing');
        await copyWithRetry(sourceFilePath, targetFilePath, 3);
        await updateSelectionStatus(photo.selectionId, 'completed');
        await createProcessingLog(photo.id, 'success');
        copiedFiles.push(targetFilePath);
        log.info(`Copied ${sourceFilePath} to ${targetFilePath}`);
      } catch (error) {
        log.error(`Failed to copy RAW for ${photo.filename}:`, error);
        await updateSelectionStatus(photo.selectionId, 'failed');
        await createProcessingLog(
          photo.id,
          'failed',
          error instanceof Error ? error.message : 'Copy failed'
        );
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

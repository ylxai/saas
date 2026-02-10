// lib/fileService.ts
import { query, TABLES } from './db';
import { Photo, Event, Client, Selection } from '@/types';
import { uploadFile, getSignedUrlForFile, createThumbnail } from './storage';
import sharp from 'sharp';

/**
 * Simpan event baru ke database
 */
export async function createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event | null> {
  try {
    const { rows } = await query(
      `INSERT INTO ${TABLES.EVENTS} (name, client_name, client_id, date, folder_path, status, photo_count) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        eventData.name,
        eventData.clientName,
        eventData.clientId || null,
        eventData.date,
        eventData.folderPath,
        eventData.status,
        eventData.photoCount,
      ]
    );

    return rows[0] as Event;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

/**
 * Ambil semua event
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.EVENTS} ORDER BY created_at DESC`
    );

    return rows as Event[];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

/**
 * Ambil semua event untuk klien tertentu
 */
export async function getEventsByClientId(clientId: string): Promise<Event[]> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.EVENTS} WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId]
    );

    return rows as Event[];
  } catch (error) {
    console.error('Error fetching events by client:', error);
    return [];
  }
}

/**
 * Ambil event berdasarkan ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.EVENTS} WHERE id = $1`,
      [eventId]
    );

    return rows[0] as Event || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Simpan file ke database
 */
export async function createFile(fileData: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Photo | null> {
  try {
    const { rows } = await query(
      `INSERT INTO ${TABLES.FILES} (event_id, filename, url, thumbnail_url, is_selected, file_type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [fileData.eventId, fileData.filename, fileData.url, fileData.thumbnailUrl, fileData.isSelected, fileData.fileType]
    );

    return rows[0] as Photo;
  } catch (error) {
    console.error('Error creating file:', error);
    return null;
  }
}

/**
 * Ambil semua file untuk event tertentu
 */
export async function getFilesByEventId(eventId: string): Promise<Photo[]> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.FILES} WHERE event_id = $1 ORDER BY created_at ASC`,
      [eventId]
    );

    return rows as Photo[];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

/**
 * Ambil semua file untuk event tertentu milik klien tertentu
 */
export async function getFilesByEventIdForClient(eventId: string, clientId: string): Promise<Photo[]> {
  try {
    const { rows } = await query(
      `SELECT f.*
       FROM ${TABLES.FILES} f
       JOIN ${TABLES.EVENTS} e ON e.id = f.event_id
       WHERE f.event_id = $1 AND e.client_id = $2
       ORDER BY f.created_at ASC`,
      [eventId, clientId]
    );

    return rows as Photo[];
  } catch (error) {
    console.error('Error fetching files by event and client:', error);
    return [];
  }
}

/**
 * Update status seleksi file
 */
export async function updateFileSelectionStatus(fileId: string, isSelected: boolean): Promise<boolean> {
  try {
    const { rowCount } = await query(
      `UPDATE ${TABLES.FILES} SET is_selected = $1, updated_at = NOW() WHERE id = $2`,
      [isSelected, fileId]
    );

    return rowCount !== 0;
  } catch (error) {
    console.error('Error updating file selection status:', error);
    return false;
  }
}

/**
 * Ambil file berdasarkan ID
 */
export async function getFileById(fileId: string): Promise<Photo | null> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.FILES} WHERE id = $1`,
      [fileId]
    );

    return rows[0] as Photo || null;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

/**
 * Simpan seleksi file oleh klien
 */
export async function createSelection(selectionData: Omit<Selection, 'id' | 'selectedAt'>): Promise<Selection | null> {
  try {
    const { rows } = await query(
      `INSERT INTO ${TABLES.SELECTIONS} (file_id, client_id, status) 
       VALUES ($1, $2, $3) RETURNING *`,
      [selectionData.fileId, selectionData.clientId, selectionData.status]
    );

    return rows[0] as Selection;
  } catch (error) {
    console.error('Error creating selection:', error);
    return null;
  }
}

/**
 * Ambil semua seleksi untuk klien tertentu
 */
export async function getSelectionsByClientId(clientId: string): Promise<Selection[]> {
  try {
    const { rows } = await query(
      `SELECT * FROM ${TABLES.SELECTIONS} WHERE client_id = $1 ORDER BY selected_at DESC`,
      [clientId]
    );

    return rows as Selection[];
  } catch (error) {
    console.error('Error fetching selections:', error);
    return [];
  }
}

/**
 * Upload file ke R2 dan simpan metadata ke database
 */
export async function uploadPhotoToStorage(
  fileBuffer: Buffer,
  fileName: string,
  eventId: string,
  fileType: 'RAW' | 'JPG' | 'OTHER'
): Promise<Photo | null> {
  try {
    // Upload file utama
    const uploadResult = await uploadFile(fileBuffer, fileName, 'image/jpeg');
    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Buat thumbnail
    let thumbnailUrl: string | undefined;
    try {
      // Buat thumbnail menggunakan sharp
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailName = `thumbnails/${fileName}`;
      const thumbnailResult = await uploadFile(thumbnailBuffer, thumbnailName, 'image/jpeg');
      
      if (thumbnailResult.success && thumbnailResult.url) {
        thumbnailUrl = thumbnailResult.url;
      }
    } catch (thumbnailError) {
      console.error('Error creating thumbnail:', thumbnailError);
      // Jangan hentikan proses jika thumbnail gagal
    }

    // Simpan metadata ke database
    const photoData: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'> = {
      filename: fileName,
      url: uploadResult.url,
      thumbnailUrl,
      isSelected: false,
      fileType,
      eventId,
    };

    return await createFile(photoData);
  } catch (error) {
    console.error('Error uploading photo to storage:', error);
    return null;
  }
}

/**
 * Ambil semua file yang dipilih oleh klien
 */
export async function getSelectedFilesByClientId(clientId: string): Promise<Photo[]> {
  try {
    const { rows } = await query(`
      SELECT f.* 
      FROM ${TABLES.FILES} f
      JOIN ${TABLES.SELECTIONS} s ON f.id = s.file_id
      WHERE s.client_id = $1 AND f.is_selected = true
      ORDER BY f.created_at ASC
    `, [clientId]);

    return rows as Photo[];
  } catch (error) {
    console.error('Error fetching selected files:', error);
    return [];
  }
}

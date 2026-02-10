// main/syncService.ts
import { getDatabaseClient } from './database';
import * as log from 'electron-log';
import { PhotoFile } from './fileProcessor';

export interface SyncStatus {
  lastSync: Date | null;
  status: 'idle' | 'syncing' | 'completed' | 'error';
  message: string;
  syncedCount: number;
}

class SyncService {
  private lastSync: Date | null = null;
  private status: SyncStatus['status'] = 'idle';
  private message: string = '';
  private syncedCount: number = 0;

  constructor() {
    log.info('Sync service initialized');
  }

  public getStatus(): SyncStatus {
    return {
      lastSync: this.lastSync,
      status: this.status,
      message: this.message,
      syncedCount: this.syncedCount,
    };
  }

  public async syncWithDatabase(): Promise<SyncStatus> {
    this.status = 'syncing';
    this.message = 'Starting synchronization with database...';
    
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
      const selectedPhotos = result as PhotoFile[];
      
      this.syncedCount = selectedPhotos.length;
      this.lastSync = new Date();
      this.status = 'completed';
      this.message = `Successfully synchronized ${selectedPhotos.length} selected photos`;
      
      log.info(this.message);
      
      return this.getStatus();
    } catch (error) {
      this.status = 'error';
      this.message = `Error synchronizing with database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      log.error(this.message);
      
      return this.getStatus();
    }
  }

  public async getSelectedPhotos(): Promise<PhotoFile[]> {
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
      return result as PhotoFile[];
    } catch (error) {
      log.error('Error fetching selected photos:', error);
      throw error;
    }
  }

  public async updateSelectionStatus(fileId: string, status: 'completed' | 'failed') {
    try {
      const sql = getDatabaseClient();
      
      // Update status selection berdasarkan file_id
      const query = `
        UPDATE selections 
        SET status = $1, updated_at = NOW() 
        WHERE file_id = $2
      `;
      
      await sql(query, [status, fileId]);
      
      log.info(`Updated selection status for file ${fileId} to ${status}`);
    } catch (error) {
      log.error(`Error updating selection status for file ${fileId}:`, error);
      throw error;
    }
  }
}

export default new SyncService();
// renderer/utils/electronApi.ts
import { ProcessStatus } from '../../types/processStatus';

export interface PhotoProcessResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

export interface ElectronApi {
  openDirectory: () => Promise<string[]>;
  logInfo: (message: string) => Promise<void>;
  logError: (message: string) => Promise<void>;
  processPhotos: (sourceFolder: string, targetFolder: string) => Promise<PhotoProcessResult>;
}

// Fungsi untuk mengecek apakah kita berada di lingkungan Electron
export function isElectron(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.electronAPI !== 'undefined';
}

// Wrapper untuk memanggil API Electron dengan fallback untuk lingkungan pengembangan
export const electronAPI: ElectronApi = {
  openDirectory: async (): Promise<string[]> => {
    if (isElectron()) {
      return window.electronAPI.openDirectory();
    } else {
      // Fallback untuk lingkungan pengembangan
      console.log('Electron API not available, returning mock data');
      return ['/mock/path/to/folder'];
    }
  },
  
  logInfo: async (message: string): Promise<void> => {
    if (isElectron()) {
      return window.electronAPI.logInfo(message);
    } else {
      console.log('[INFO]', message);
    }
  },
  
  logError: async (message: string): Promise<void> => {
    if (isElectron()) {
      return window.electronAPI.logError(message);
    } else {
      console.error('[ERROR]', message);
    }
  },
  
  processPhotos: async (sourceFolder: string, targetFolder: string): Promise<PhotoProcessResult> => {
    if (isElectron()) {
      return window.electronAPI.processPhotos(sourceFolder, targetFolder);
    } else {
      // Fallback untuk lingkungan pengembangan
      console.log(`Mock processing from ${sourceFolder} to ${targetFolder}`);
      return {
        success: true,
        processedCount: 5,
        errors: []
      };
    }
  }
};
// types/electron-api.ts
export interface ElectronAPI {
  openDirectory: () => Promise<string[]>;
  logInfo: (message: string) => Promise<void>;
  logError: (message: string) => Promise<void>;
  processPhotos: (sourceFolder: string, targetFolder: string) => Promise<{
    success: boolean;
    processedCount: number;
    errors: string[];
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
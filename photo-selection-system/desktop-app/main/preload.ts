// main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  logInfo: (message: string) => ipcRenderer.invoke('log:info', message),
  logError: (message: string) => ipcRenderer.invoke('log:error', message),
});
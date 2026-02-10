// main/index.ts
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as log from 'electron-log';
import { initializeDatabase } from './database';
import { setupFileProcessing, processSelectedPhotos } from './fileProcessor';

// Set log level
log.transports.file.level = 'info';

let mainWindow: BrowserWindow | null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window
  mainWindow = new BrowserWindow({
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    resizable: true,
    icon: path.join(__dirname, '../assets/icon.png'),
    width: 1200,
  });

  // Load the index.html when not in development
  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log window creation
  log.info('Main window created');
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.whenReady().then(async () => {
  // Initialize database connection
  await initializeDatabase();
  
  // Setup file processing services
  setupFileProcessing();
  
  createWindow();

  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication between renderer and main process
ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory', 'multiSelections']
  });
  return result.filePaths;
});

ipcMain.handle('log:info', async (event, message) => {
  log.info(message);
});

ipcMain.handle('log:error', async (event, message) => {
  log.error(message);
});

// Handler untuk memproses foto
ipcMain.handle('process-photos', async (event, sourceFolder: string, targetFolder: string) => {
  try {
    const result = await processSelectedPhotos(sourceFolder, targetFolder);
    return result;
  } catch (error) {
    log.error('Error processing photos:', error);
    return {
      success: false,
      processedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
});
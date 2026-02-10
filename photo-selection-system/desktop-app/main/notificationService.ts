// main/notificationService.ts
import { BrowserWindow } from 'electron';
import * as log from 'electron-log';

export interface NotificationOptions {
  title: string;
  body: string;
  silent?: boolean;
  icon?: string;
}

class NotificationService {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    log.info('Notification service initialized');
  }

  public setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  public showNotification(options: NotificationOptions) {
    // Di lingkungan Electron, kita bisa menggunakan Notification API
    // Tapi karena kita menggunakan context isolation, kita perlu mengirim pesan ke renderer
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('show-notification', options);
      log.info(`Notification sent: ${options.title}`);
    } else {
      log.warn('Main window not available for notification');
    }
  }

  public showSuccessNotification(title: string, body: string) {
    this.showNotification({
      title,
      body,
      icon: 'success'
    });
  }

  public showErrorNotification(title: string, body: string) {
    this.showNotification({
      title,
      body,
      icon: 'error'
    });
  }

  public showInfoNotification(title: string, body: string) {
    this.showNotification({
      title,
      body,
      icon: 'info'
    });
  }

  public showProgressNotification(title: string, body: string, progress: number) {
    this.showNotification({
      title,
      body: `${body} (${progress}%)`,
      icon: 'progress'
    });
  }
}

export default new NotificationService();
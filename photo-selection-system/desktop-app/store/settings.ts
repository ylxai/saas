// store/settings.ts
import Store from 'electron-store';

export interface Settings {
  lastSourceFolder?: string;
  lastTargetFolder?: string;
  lastProcessedDate?: string;
  databaseUrl?: string;
  cloudflareR2Config?: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    accountId: string;
    publicUrl: string;
  };
}

const schema: Store.Schema<Settings> = {
  lastSourceFolder: {
    type: 'string',
  },
  lastTargetFolder: {
    type: 'string',
  },
  lastProcessedDate: {
    type: 'string',
  },
  databaseUrl: {
    type: 'string',
  },
  cloudflareR2Config: {
    type: 'object',
    properties: {
      accessKeyId: { type: 'string' },
      secretAccessKey: { type: 'string' },
      bucketName: { type: 'string' },
      accountId: { type: 'string' },
      publicUrl: { type: 'string' },
    },
    default: {
      accessKeyId: '',
      secretAccessKey: '',
      bucketName: '',
      accountId: '',
      publicUrl: '',
    },
  },
};

class SettingsStore extends Store<Settings> {
  constructor() {
    super({ schema });
  }

  setLastSourceFolder(folderPath: string) {
    this.set('lastSourceFolder', folderPath);
  }

  getLastSourceFolder(): string | undefined {
    return this.get('lastSourceFolder');
  }

  setLastTargetFolder(folderPath: string) {
    this.set('lastTargetFolder', folderPath);
  }

  getLastTargetFolder(): string | undefined {
    return this.get('lastTargetFolder');
  }

  setLastProcessedDate(date: string) {
    this.set('lastProcessedDate', date);
  }

  getLastProcessedDate(): string | undefined {
    return this.get('lastProcessedDate');
  }

  setDatabaseUrl(url: string) {
    this.set('databaseUrl', url);
  }

  getDatabaseUrl(): string | undefined {
    return this.get('databaseUrl');
  }

  setCloudflareR2Config(config: Settings['cloudflareR2Config']) {
    this.set('cloudflareR2Config', config);
  }

  getCloudflareR2Config(): Settings['cloudflareR2Config'] | undefined {
    return this.get('cloudflareR2Config');
  }
}

export default new SettingsStore();
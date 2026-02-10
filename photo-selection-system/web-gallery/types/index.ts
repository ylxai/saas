// types/index.ts
export interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  isSelected: boolean;
  fileType: 'RAW' | 'JPG' | 'OTHER';
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  name: string;
  clientName: string;
  date: Date;
  folderPath: string;
  status: 'active' | 'archived' | 'completed';
  photoCount?: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt: Date;
}

export interface Selection {
  id: string;
  fileId: string;
  clientId: string;
  selectedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ProcessingLog {
  id: string;
  fileId: string;
  action: 'copy' | 'move' | 'edit' | 'delete';
  timestamp: Date;
  status: 'success' | 'failed' | 'in-progress';
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GalleryFilter {
  eventId?: string;
  fileType?: 'RAW' | 'JPG' | 'ALL';
  status?: 'selected' | 'unselected' | 'all';
  searchTerm?: string;
}
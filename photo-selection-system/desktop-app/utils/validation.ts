// utils/validation.ts
import { z } from 'zod';

// Schema untuk konfigurasi Cloudflare R2
export const CloudflareR2ConfigSchema = z.object({
  accessKeyId: z.string().min(1, 'Access key ID is required'),
  secretAccessKey: z.string().min(1, 'Secret access key is required'),
  bucketName: z.string().min(1, 'Bucket name is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  publicUrl: z.string().url('Public URL must be a valid URL'),
});

// Schema untuk pengaturan aplikasi
export const SettingsSchema = z.object({
  lastSourceFolder: z.string().optional(),
  lastTargetFolder: z.string().optional(),
  lastProcessedDate: z.string().optional(),
  databaseUrl: z.string().optional(),
  cloudflareR2Config: CloudflareR2ConfigSchema.optional(),
});

// Schema untuk file foto
export const PhotoFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  isSelected: z.boolean(),
  fileType: z.enum(['RAW', 'JPG', 'OTHER']),
  eventId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema untuk seleksi
export const SelectionSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  clientId: z.string(),
  selectedAt: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
});

// Fungsi untuk memvalidasi konfigurasi R2
export const validateR2Config = (data: unknown) => {
  return CloudflareR2ConfigSchema.parse(data);
};

// Fungsi untuk memvalidasi pengaturan
export const validateSettings = (data: unknown) => {
  return SettingsSchema.parse(data);
};

// Fungsi untuk memvalidasi file foto
export const validatePhotoFile = (data: unknown) => {
  return PhotoFileSchema.parse(data);
};

// Fungsi untuk memvalidasi seleksi
export const validateSelection = (data: unknown) => {
  return SelectionSchema.parse(data);
};

// Fungsi untuk memvalidasi dengan aman (tidak melempar error)
export const safeValidateR2Config = (data: unknown) => {
  return CloudflareR2ConfigSchema.safeParse(data);
};

export const safeValidateSettings = (data: unknown) => {
  return SettingsSchema.safeParse(data);
};

export const safeValidatePhotoFile = (data: unknown) => {
  return PhotoFileSchema.safeParse(data);
};

export const safeValidateSelection = (data: unknown) => {
  return SelectionSchema.safeParse(data);
};
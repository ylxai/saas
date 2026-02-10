// utils/validation.ts
import { z } from 'zod';

// Schema untuk Photo
export const PhotoSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  isSelected: z.boolean().default(false),
  fileType: z.enum(['RAW', 'JPG', 'OTHER']),
  eventId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema untuk Event
export const EventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  clientName: z.string().min(1),
  date: z.date(),
  folderPath: z.string().min(1),
  status: z.enum(['active', 'archived', 'completed']).default('active'),
  photoCount: z.number().optional(),
});

// Schema untuk Client
export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  apiKey: z.string().min(1),
  createdAt: z.date(),
});

// Schema untuk Selection
export const SelectionSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(),
  clientId: z.string().uuid(),
  selectedAt: z.date(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
});

// Schema untuk ProcessingLog
export const ProcessingLogSchema = z.object({
  id: z.string().uuid(),
  fileId: z.string().uuid(),
  action: z.enum(['copy', 'move', 'edit', 'delete']),
  timestamp: z.date(),
  status: z.enum(['success', 'failed', 'in-progress']),
  details: z.string().optional(),
});

// Schema untuk GalleryFilter
export const GalleryFilterSchema = z.object({
  eventId: z.string().uuid().optional(),
  fileType: z.enum(['RAW', 'JPG', 'ALL']).optional(),
  status: z.enum(['selected', 'unselected', 'all']).optional(),
  searchTerm: z.string().optional(),
});

// Fungsi untuk memvalidasi data
export const validatePhoto = (data: unknown) => PhotoSchema.parse(data);
export const validateEvent = (data: unknown) => EventSchema.parse(data);
export const validateClient = (data: unknown) => ClientSchema.parse(data);
export const validateSelection = (data: unknown) => SelectionSchema.parse(data);
export const validateProcessingLog = (data: unknown) => ProcessingLogSchema.parse(data);
export const validateGalleryFilter = (data: unknown) => GalleryFilterSchema.parse(data);

// Fungsi untuk memvalidasi data dengan safe parsing
export const safeValidatePhoto = (data: unknown) => PhotoSchema.safeParse(data);
export const safeValidateEvent = (data: unknown) => EventSchema.safeParse(data);
export const safeValidateClient = (data: unknown) => ClientSchema.safeParse(data);
export const safeValidateSelection = (data: unknown) => SelectionSchema.safeParse(data);
export const safeValidateProcessingLog = (data: unknown) => ProcessingLogSchema.safeParse(data);
export const safeValidateGalleryFilter = (data: unknown) => GalleryFilterSchema.safeParse(data);
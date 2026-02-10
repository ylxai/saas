// lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config';

// Inisialisasi S3 client untuk Cloudflare R2
const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' region
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface FileMetadata {
  filename: string;
  contentType: string;
  size: number;
  lastModified?: Date;
}

/**
 * Upload file ke Cloudflare R2
 */
export async function uploadFile(
  fileBuffer: Buffer, 
  fileName: string, 
  contentType: string,
  bucketName: string = config.r2.bucketName
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    const fileUrl = `${config.r2.publicUrl}/${fileName}`;
    
    return {
      success: true,
      url: fileUrl,
    };
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Dapatkan URL yang ditandatangani untuk akses file
 */
export async function getSignedUrlForFile(
  fileName: string,
  expiresIn: number = 3600, // 1 jam dalam detik
  bucketName: string = config.r2.bucketName
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

/**
 * Hapus file dari Cloudflare R2
 */
export async function deleteFile(
  fileName: string,
  bucketName: string = config.r2.bucketName
): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    return false;
  }
}

/**
 * Dapatkan metadata file dari Cloudflare R2
 */
export async function getFileMetadata(
  fileName: string,
  bucketName: string = config.r2.bucketName
): Promise<FileMetadata | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const response = await r2Client.send(command);
    
    return {
      filename: fileName,
      contentType: response.ContentType || 'application/octet-stream',
      size: response.ContentLength || 0,
      lastModified: response.LastModified || undefined,
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

/**
 * Buat thumbnail dari file gambar
 */
export async function createThumbnail(
  originalFileName: string,
  thumbnailBuffer: Buffer,
  bucketName: string = config.r2.bucketName
): Promise<UploadResult> {
  const thumbnailFileName = `thumbnails/${originalFileName}`;
  return uploadFile(thumbnailBuffer, thumbnailFileName, 'image/jpeg', bucketName);
}
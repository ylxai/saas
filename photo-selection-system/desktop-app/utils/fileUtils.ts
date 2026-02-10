// utils/fileUtils.ts
import * as fs from 'fs/promises';
import * as path from 'path';

// Ekstensi file RAW yang umum
export const RAW_EXTENSIONS = [
  '.raw', '.cr2', '.nef', '.orf', '.arw', '.dng', 
  '.raf', '.rw2', '.pef', '.sr2', '.x3f', '.3fr', 
  '.nrw', '.mrw', '.kdc', '.iiq'
];

// Ekstensi file gambar umum
export const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', 
  '.gif', '.webp'
];

/**
 * Mencari file RAW yang sesuai dengan nama file JPG
 * @param fileName Nama file JPG (misalnya IMG_0001.jpg)
 * @param sourceFolderPath Path folder sumber yang berisi file RAW
 * @returns Path lengkap ke file RAW yang cocok, atau null jika tidak ditemukan
 */
export async function findMatchingRawFile(fileName: string, sourceFolderPath: string): Promise<string | null> {
  try {
    // Ambil nama file tanpa ekstensi
    const baseName = path.basename(fileName, path.extname(fileName));
    
    // Coba setiap ekstensi RAW
    for (const ext of RAW_EXTENSIONS) {
      const rawFileName = baseName + ext;
      const rawFilePath = path.join(sourceFolderPath, rawFileName);
      
      // Periksa apakah file ada
      try {
        await fs.access(rawFilePath);
        return rawFilePath; // File ditemukan
      } catch {
        // File tidak ditemukan, lanjutkan ke ekstensi berikutnya
        continue;
      }
    }
    
    // Jika tidak ada file RAW yang cocok ditemukan
    return null;
  } catch (error) {
    console.error('Error finding matching RAW file:', error);
    return null;
  }
}

/**
 * Mendapatkan daftar file dalam folder dengan ekstensi tertentu
 * @param folderPath Path folder untuk dipindai
 * @param extensions Array ekstensi file untuk disertakan (misalnya ['.jpg', '.png'])
 * @returns Array nama file yang ditemukan
 */
export async function getFilesByExtensions(folderPath: string, extensions: string[]): Promise<string[]> {
  try {
    const allFiles = await fs.readdir(folderPath);
    
    // Filter file berdasarkan ekstensi
    const filteredFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    });
    
    return filteredFiles;
  } catch (error) {
    console.error('Error getting files by extensions:', error);
    return [];
  }
}

/**
 * Memeriksa apakah sebuah path adalah folder yang valid
 * @param folderPath Path folder untuk diperiksa
 * @returns true jika path adalah folder yang valid, false jika tidak
 */
export async function isValidFolder(folderPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(folderPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Membuat folder jika belum ada
 * @param folderPath Path folder untuk dibuat
 * @returns true jika folder berhasil dibuat atau sudah ada
 */
export async function ensureFolderExists(folderPath: string): Promise<boolean> {
  try {
    await fs.mkdir(folderPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error ensuring folder exists:', error);
    return false;
  }
}

/**
 * Mendapatkan ukuran file dalam bytes
 * @param filePath Path file untuk dicek ukurannya
 * @returns Ukuran file dalam bytes, atau -1 jika gagal
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return -1;
  }
}

/**
 * Mendapatkan informasi dasar file
 * @param filePath Path file untuk diambil informasinya
 * @returns Objek dengan informasi file atau null jika gagal
 */
export async function getFileInfo(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      name: path.basename(filePath),
      size: stats.size,
      extension: path.extname(filePath),
      modified: stats.mtime,
      created: stats.birthtime,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}
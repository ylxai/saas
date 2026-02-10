// components/FileUploader.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Button } from './Button';

interface FileUploaderProps {
  eventId: string;
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  eventId, 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadSingleFile = async (file: File, totalFiles: number, currentIndex: number): Promise<boolean> => {
    const singleFileProgress = (currentIndex / totalFiles) * 100;
    setUploadProgress(Math.round(singleFileProgress));

    try {
      // Buat FormData untuk dikirim
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);
      formData.append('fileType', file.type.startsWith('image/x-') ? 'RAW' : 'JPG'); // Simplified detection

      // Kirim ke API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to upload ${file.name}`);
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload semua file secara parallel
      const uploadPromises = fileArray.map((file, index) => 
        uploadSingleFile(file, fileArray.length, index)
      );

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(Boolean).length;

      setUploadProgress(100);

      if (successCount === fileArray.length) {
        onUploadSuccess?.();
      } else {
        const errorMsg = `Uploaded ${successCount} of ${fileArray.length} files`;
        setError(errorMsg);
        onUploadError?.(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upload Photos</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            onClick={handleClick}
            variant="outline"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.arw" // Format umum foto
            className="hidden"
            multiple
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>Supported formats: JPG, PNG, RAW (CR2, NEF, ARW, etc.)</p>
        <p className="mt-1">Maximum file size: 500MB per file</p>
      </div>
    </div>
  );
};
// components/SelectedPhotosList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Photo } from '@/types';
import { useGalleryStore } from '@/store/galleryStore';

interface SelectedPhotosListProps {
  selectedPhotoIds: string[];
}

const SelectedPhotosList: React.FC<SelectedPhotosListProps> = ({ selectedPhotoIds }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { photos } = useGalleryStore();
  
  // Ambil foto lengkap berdasarkan ID
  const selectedPhotos = photos.filter(photo => selectedPhotoIds.includes(photo.id));

  const generateTxtFile = () => {
    setIsGenerating(true);
    
    // Membuat konten file .txt dari daftar foto yang dipilih
    const fileContent = selectedPhotos
      .map(photo => photo.filename)
      .join('\n');
    
    // Membuat blob dari konten
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    setDownloadUrl(url);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'selected_photos.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Membersihkan URL object setelah download
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  useEffect(() => {
    // Membersihkan URL object saat komponen dilepas
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Selected Photos ({selectedPhotos.length})
      </h3>
      
      {selectedPhotos.length === 0 ? (
        <p className="text-gray-500 italic">No photos selected yet</p>
      ) : (
        <>
          <div className="max-h-60 overflow-y-auto mb-4 border rounded">
            <ul className="divide-y divide-gray-200">
              {selectedPhotos.map((photo) => (
                <li key={photo.id} className="px-4 py-2 text-sm">
                  <span className="font-mono">{photo.filename}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {selectedPhotos.length} photo(s) selected
            </p>
            
            <Button
              onClick={generateTxtFile}
              disabled={isGenerating || selectedPhotos.length === 0}
              className="ml-4"
            >
              {isGenerating ? 'Generating...' : 'Generate .txt File'}
            </Button>
          </div>
          
          {downloadUrl && (
            <div className="mt-4">
              <Button
                onClick={handleDownload}
                className="w-full"
              >
                Download selected_photos.txt
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { SelectedPhotosList };
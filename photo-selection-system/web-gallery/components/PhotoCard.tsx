// components/PhotoCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Photo } from '@/types';
import { useGalleryStore } from '@/store/galleryStore';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
  onPhotoClick?: (photo: Photo) => void;
  priority?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = React.memo(({ photo, onPhotoClick, priority = false }) => {
  const { togglePhotoSelection, selectedPhotos } = useGalleryStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isSelected = selectedPhotos.includes(photo.id);

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePhotoSelection(photo.id);
  };

  const handleClick = () => {
    onPhotoClick?.(photo);
  };

  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-lg shadow-sm hover:shadow-lg transition-all duration-300",
        "bg-gray-100 cursor-pointer mb-4 break-inside-avoid",
        isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      )}
      onClick={handleClick}
    >
      {/* Gambar - Masonry style dengan aspect ratio asli */}
      {!imageError ? (
        <div className="relative w-full" style={{ aspectRatio: 'auto' }}>
          <Image
            src={photo.thumbnailUrl || photo.url}
            alt={photo.filename}
            width={400}
            height={300}
            className={cn(
              "w-full h-auto object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority={priority}
            unoptimized
          />
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}

      {/* Overlay saat hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <button 
            className="bg-white rounded-full p-2 shadow-lg"
            onClick={handleToggleSelection}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn(
                "h-5 w-5 transition-colors",
                isSelected ? "text-blue-500" : "text-gray-700"
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isSelected ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              )}
            </svg>
          </button>
          
          <button className="bg-white rounded-full p-2 shadow-lg ml-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Indikator seleksi */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-white" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}

      {/* Info file */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs truncate">
        <span className="block truncate">{photo.filename}</span>
      </div>
    </div>
  );
});

PhotoCard.displayName = 'PhotoCard';
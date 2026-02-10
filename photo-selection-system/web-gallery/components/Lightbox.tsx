// components/Lightbox.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { Photo } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const currentPhoto = photos[currentIndex];

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation - Previous */}
      {currentIndex > 0 && (
        <button
          className="absolute left-4 z-10 p-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          aria-label="Previous photo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Navigation - Next */}
      {currentIndex < photos.length - 1 && (
        <button
          className="absolute right-4 z-10 p-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next photo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Main Image Container */}
      <div 
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.filename}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] w-auto h-auto object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Photo Info */}
        <div className="mt-4 text-center text-white">
          <p className="text-lg font-medium">{currentPhoto.filename}</p>
          <p className="text-sm text-white/60 mt-1">
            {currentIndex + 1} of {photos.length}
            {currentPhoto.isSelected && (
              <span className="ml-2 text-blue-400">• Selected</span>
            )}
          </p>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4 py-2 bg-black/50 rounded-full">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index);
            }}
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all",
              index === currentIndex 
                ? "border-blue-500 opacity-100" 
                : "border-transparent opacity-50 hover:opacity-75"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Lightbox;

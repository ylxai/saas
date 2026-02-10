// components/PhotoGrid.tsx
'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { PhotoCard } from './PhotoCard';
import { Lightbox } from './Lightbox';
import { Photo } from '@/types';
import Masonry from 'react-masonry-css';

const ITEMS_PER_PAGE = 24; // Load 24 photos initially, then more on scroll

export const PhotoGrid: React.FC = () => {
  const { photos, currentEventId, filters } = useGalleryStore();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter photos dengan useMemo untuk mencegah re-filter pada setiap render
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Filter berdasarkan event
      if (currentEventId && photo.eventId !== currentEventId) {
        return false;
      }

      // Filter berdasarkan file type
      if (filters.fileType && filters.fileType !== 'ALL') {
        if (photo.fileType !== filters.fileType) {
          return false;
        }
      }

      // Filter berdasarkan status seleksi
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'selected' && !photo.isSelected) {
          return false;
        }
        if (filters.status === 'unselected' && photo.isSelected) {
          return false;
        }
      }

      // Filter berdasarkan search term
      if (filters.searchTerm) {
        if (!photo.filename.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [photos, currentEventId, filters]);

  // Reset visible count saat filter berubah
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [filters, currentEventId]);

  // Infinite scroll implementation
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // Load more when within 300px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 300) {
        if (visibleCount < filteredPhotos.length) {
          setIsLoadingMore(true);
          // Simulate small delay to prevent rapid firing
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredPhotos.length));
            setIsLoadingMore(false);
          }, 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, filteredPhotos.length, isLoadingMore]);

  // Photos yang ditampilkan (lazy loaded batch)
  const visiblePhotos = useMemo(() => {
    return filteredPhotos.slice(0, visibleCount);
  }, [filteredPhotos, visibleCount]);

  // Konfigurasi untuk masonry layout
  const breakpointColumnsObj = {
    default: 4,
    1400: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const handlePhotoClick = useCallback((photo: Photo) => {
    const index = filteredPhotos.findIndex(p => p.id === photo.id);
    setCurrentPhotoIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  }, [filteredPhotos]);

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  if (filteredPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
        <p className="text-gray-500">
          {currentEventId 
            ? "There are no photos in this event that match your filters." 
            : "Please select an event to view photos."}
        </p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -16px;
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 16px;
          background-clip: padding-box;
        }
        .my-masonry-grid_column > div {
          margin-bottom: 16px;
        }
      `}</style>
      
      <div className="mb-4 text-sm text-gray-600">
        Showing {visiblePhotos.length} of {filteredPhotos.length} photos
      </div>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {visiblePhotos.map((photo, index) => (
          <PhotoCard 
            key={photo.id} 
            photo={photo} 
            onPhotoClick={handlePhotoClick}
            priority={index < 8}
          />
        ))}
      </Masonry>

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Load more button (fallback) */}
      {visibleCount < filteredPhotos.length && !isLoadingMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredPhotos.length))}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More ({filteredPhotos.length - visibleCount} remaining)
          </button>
        </div>
      )}
      
      <Lightbox
        photos={filteredPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onNavigate={setCurrentPhotoIndex}
      />
    </>
  );
};
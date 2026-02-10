// components/PhotoGrid.tsx
'use client';

import React, { useMemo } from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { PhotoCard } from './PhotoCard';
import Masonry from 'react-masonry-css';

export const PhotoGrid: React.FC = () => {
  const { photos, currentEventId, filters } = useGalleryStore();

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

  // Konfigurasi untuk masonry layout
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

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
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {filteredPhotos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </Masonry>
  );
};
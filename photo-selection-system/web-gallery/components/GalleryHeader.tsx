// components/GalleryHeader.tsx
'use client';

import React from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { Button } from './Button';

export const GalleryHeader: React.FC = () => {
  const { 
    selectedPhotos, 
    events, 
    currentEventId, 
    setCurrentEvent, 
    selectAllPhotos, 
    deselectAllPhotos,
    exportSelection,
    isLoading,
    setError
  } = useGalleryStore();

  const currentEvent = events.find(event => event.id === currentEventId);

  const handleExport = async () => {
    try {
      await exportSelection();
    } catch (err) {
      // Error sudah di-handle di store, tapi kita bisa log di sini jika perlu
      console.error('Export failed:', err);
    }
  };

  return (
    <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {currentEvent ? currentEvent.name : 'Select an Event'}
          </h1>
          {currentEvent && (
            <p className="text-sm text-gray-500">
              {currentEvent.clientName} • {new Date(currentEvent.date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedPhotos.length} selected
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={selectAllPhotos}
              variant="outline"
              disabled={!currentEventId || isLoading}
              className="text-sm"
            >
              Select All
            </Button>
            <Button
              onClick={deselectAllPhotos}
              variant="outline"
              disabled={!currentEventId || isLoading}
              className="text-sm"
            >
              Deselect All
            </Button>
          </div>

          <Button
            onClick={handleExport}
            disabled={selectedPhotos.length === 0 || isLoading}
            className="whitespace-nowrap"
          >
            {isLoading ? 'Exporting...' : `Export ${selectedPhotos.length} Photos`}
          </Button>
        </div>
      </div>
    </header>
  );
};
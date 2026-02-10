// app/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryHeader } from '@/components/GalleryHeader';
import { PhotoGrid } from '@/components/PhotoGrid';
import { PhotoFilters } from '@/components/PhotoFilters';
import { SelectedPhotosList } from '@/components/SelectedPhotosList';
import { useGalleryStore } from '@/store/galleryStore';

export default function Home() {
  const router = useRouter();
  const {
    fetchEvents,
    fetchPhotos,
    currentEventId,
    isLoading,
    error,
    selectedPhotos
  } = useGalleryStore();

  // Cek apakah pengguna sudah login
  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    if (!token) {
      // Jika tidak ada token, redirect ke halaman login
      router.push('/login');
    } else {
      // Jika ada token, lanjutkan ke dashboard
      // Fetch events saat komponen dimuat
      fetchEvents().catch((err) => {
        console.error('Failed to fetch events:', err);
      });

      // Jika ada event yang dipilih, fetch photonya
      if (currentEventId) {
        fetchPhotos(currentEventId).catch((err) => {
          console.error('Failed to fetch photos:', err);
        });
      }
    }
  }, [currentEventId, fetchEvents, fetchPhotos, router]);

  if (isLoading && !currentEventId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col">
          <div className="h-16 bg-gray-200"></div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GalleryHeader />
      
      <main className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
        <PhotoFilters />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <PhotoGrid />
          </div>
          <div className="lg:col-span-1">
            <SelectedPhotosList selectedPhotoIds={selectedPhotos} />
          </div>
        </div>
      </main>
    </div>
  );
}
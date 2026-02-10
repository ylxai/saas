// store/galleryStore.ts
import { create } from 'zustand';
import { Photo, Event, GalleryFilter } from '@/types';

interface GalleryState {
  photos: Photo[];
  events: Event[];
  selectedPhotos: string[]; // array of photo IDs
  currentEventId: string | null;
  filters: GalleryFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPhotos: (photos: Photo[]) => void;
  setEvents: (events: Event[]) => void;
  togglePhotoSelection: (photoId: string) => void;
  selectAllPhotos: () => void;
  deselectAllPhotos: () => void;
  setCurrentEvent: (eventId: string | null) => void;
  setFilters: (filters: Partial<GalleryFilter>) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPhotos: (eventId: string) => Promise<void>;
  fetchEvents: () => Promise<void>;
  exportSelection: () => Promise<void>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  photos: [],
  events: [],
  selectedPhotos: [],
  currentEventId: null,
  filters: {},
  isLoading: false,
  error: null,

  setPhotos: (photos) => set({ photos }),

  setEvents: (events) => set({ events }),

  togglePhotoSelection: (photoId) => {
    set((state) => {
      if (state.selectedPhotos.includes(photoId)) {
        return {
          selectedPhotos: state.selectedPhotos.filter(id => id !== photoId)
        };
      } else {
        return {
          selectedPhotos: [...state.selectedPhotos, photoId]
        };
      }
    });
  },

  selectAllPhotos: () => {
    const { photos, currentEventId } = get();
    if (!currentEventId) return;
    
    const currentEventPhotos = photos.filter(
      photo => photo.eventId === currentEventId
    );
    
    set({
      selectedPhotos: currentEventPhotos.map(photo => photo.id)
    });
  },

  deselectAllPhotos: () => {
    set({ selectedPhotos: [] });
  },

  setCurrentEvent: (eventId) => set({ currentEventId: eventId }),

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  fetchPhotos: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      // Dalam lingkungan production, kita akan menggunakan fungsi layanan langsung
      // Tapi dalam lingkungan Next.js API routes, kita tetap perlu fetch
      const response = await fetch(`/api/photos?eventId=${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch photos');
      
      set({ photos: result.data?.photos || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch events');
      
      set({ events: result.data?.events || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  exportSelection: async () => {
    set({ isLoading: true, error: null });
    try {
      const { selectedPhotos } = get();
      
      if (selectedPhotos.length === 0) {
        throw new Error('No photos selected for export');
      }
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: selectedPhotos })
      });
      
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to export selection');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to export selection');
      }
      
      // Reset selected photos after successful export
      set({ selectedPhotos: [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  }
}));
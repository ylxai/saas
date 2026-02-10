// components/PhotoFilters.tsx
'use client';

import React from 'react';
import { useGalleryStore } from '@/store/galleryStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Input } from './Input';
import { sanitizeInput, isValidSearchTerm } from '@/lib/sanitize';

export const PhotoFilters: React.FC = () => {
  const { 
    events, 
    currentEventId, 
    filters, 
    setCurrentEvent, 
    setFilters 
  } = useGalleryStore();

  const handleEventChange = (eventId: string) => {
    setCurrentEvent(eventId === 'all' ? null : eventId);
  };

  const handleFileTypeChange = (fileType: string) => {
    setFilters({ fileType: fileType === 'all' ? undefined : (fileType as 'RAW' | 'JPG' | 'ALL') });
  };

  const handleStatusChange = (status: string) => {
    setFilters({ status: status === 'all' ? undefined : (status as 'selected' | 'unselected' | 'all') });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(rawValue);
    
    // Only update if valid search term pattern
    if (isValidSearchTerm(sanitizedValue)) {
      setFilters({ searchTerm: sanitizedValue });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 mb-1">
            Event
          </label>
          <Select 
            value={currentEventId || 'all'} 
            onValueChange={handleEventChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name} ({event.clientName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="file-type" className="block text-sm font-medium text-gray-700 mb-1">
            File Type
          </label>
          <Select 
            value={filters.fileType || 'all'} 
            onValueChange={handleFileTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="JPG">JPG Only</SelectItem>
              <SelectItem value="RAW">RAW Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="selected">Selected Only</SelectItem>
              <SelectItem value="unselected">Unselected Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search photos..."
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
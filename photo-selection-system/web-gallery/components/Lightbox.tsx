// components/Lightbox.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Photo } from '@/types';
import '@/types/global';

interface LightboxProps {
  photos: Photo[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  photos,
  startIndex = 0,
  isOpen,
  onClose
}) => {
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && photos.length > 0) {
      // Dinamis mengimpor lightboxjs
      import('lightbox.js').then(() => {
        // Setelah lightbox.js dimuat, kita bisa menggunakannya
        setLoaded(true);
      }).catch((error) => {
        console.error('Error importing lightbox.js:', error);
      });
    }
  }, [isOpen, photos]);

  useEffect(() => {
    if (isOpen && loaded && lightboxRef.current && photos.length > 0) {
      // Membuat elemen gambar untuk lightbox
      const lightboxDiv = lightboxRef.current;
      lightboxDiv.innerHTML = ''; // Kosongkan kontainer

      // Membuat elemen gambar untuk lightbox
      photos.forEach((photo, index) => {
        const anchor = document.createElement('a');
        anchor.href = photo.url;
        anchor.classList.add('lightbox-item');
        anchor.dataset.lightbox = 'gallery';
        
        const img = document.createElement('img');
        img.src = photo.thumbnailUrl || photo.url;
        img.alt = photo.filename;
        img.style.display = 'none'; // Sembunyikan gambar
        
        anchor.appendChild(img);
        lightboxDiv.appendChild(anchor);
      });

      // Inisialisasi lightbox setelah elemen dibuat
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Lightbox) {
          // Membuka lightbox pada gambar tertentu
          const lightboxItems = lightboxDiv.querySelectorAll('.lightbox-item');
          if (startIndex < lightboxItems.length) {
            const targetLink = lightboxItems[startIndex] as HTMLAnchorElement;
            // Trigger click pada elemen target untuk membuka lightbox
            targetLink.click();
          }
        }
      }, 100);
    }
  }, [isOpen, loaded, photos, startIndex]);

  // Menambahkan event listener untuk menutup lightbox
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={lightboxRef} className="lightbox-container" style={{ display: 'none' }}>
      {photos.map((photo, index) => (
        <a 
          key={photo.id} 
          href={photo.url} 
          className="lightbox-item"
          data-lightbox="gallery"
          style={{ display: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={photo.thumbnailUrl || photo.url} 
            alt={photo.filename} 
          />
        </a>
      ))}
    </div>
  );
};

export { Lightbox };
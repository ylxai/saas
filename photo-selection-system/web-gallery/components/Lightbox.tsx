// components/Lightbox.tsx
'use client';

import React, { useEffect, useState } from 'react';
import lightGallery from 'lightgallery';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import { Photo } from '@/types';

interface LightboxProps {
  photos: Photo[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    lightGallery: any;
  }
}

const Lightbox: React.FC<LightboxProps> = ({ 
  photos, 
  startIndex = 0, 
  isOpen, 
  onClose 
}) => {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && containerRef && photos.length > 0) {
      // Inisialisasi lightGallery
      const lightGalleryInstance = lightGallery(containerRef, {
        plugins: [lgThumbnail, lgZoom],
        licenseKey: 'your-license-key', // Ganti dengan lisensi Anda atau hapus untuk versi open source
        speed: 500,
        download: false,
        thumbnail: true,
        animateThumb: false,
        zoomFromOrigin: false,
        allowMediaOverlap: true,
        toggleSettingsIcons: true,
        controls: true,
        slideEndAnimation: true,
        hideControlOnEnd: false,
        mousewheel: true,
        getCaptionFromTitleOrAlt: false,
        /* caption plugin */
        pager: false,
        iframeWidth: '100%',
        iframeHeight: '100%',
        videoAutoplay: true,
        videoMaxWidth: '1000px',
        staticBackdrop: true,
        youtubePlayerParams: {
          modestbranding: 1,
          showinfo: 0,
          rel: 0,
          controls: 1,
        },
        vimeoPlayerParams: {
          byline: 0,
          portrait: 0,
          color: 'A90707',
        },
        hash: false,
        closable: true,
        loop: true,
        escKey: true,
        keyPress: true,
        allowSwipeToClose: true,
        showCloseIcon: true,
        showMaximizeIcon: true,
        flipVertical: false,
        flipHorizontal: false,
      });

      // Buka lightbox pada index awal
      if (startIndex >= 0 && startIndex < photos.length) {
        lightGalleryInstance.openGallery(startIndex);
      }

      // Tambahkan event listener untuk menutup lightbox
      const handleClose = () => {
        onClose();
      };

      containerRef.addEventListener('lgClose', handleClose);

      // Bersihkan saat komponen dilepas
      return () => {
        if (lightGalleryInstance) {
          lightGalleryInstance.destroy();
        }
        containerRef.removeEventListener('lgClose', handleClose);
      };
    }
  }, [isOpen, photos, startIndex, containerRef, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      id="lightgallery-container" 
      ref={setContainerRef}
      className="hidden"
    >
      {photos.map((photo, index) => (
        <a 
          key={photo.id}
          href={photo.url}
          data-lg-size="1600-900"
          data-src={photo.url}
          data-sub-html={`<h4>${photo.filename}</h4>`}
        >
          <img 
            src={photo.thumbnailUrl || photo.url} 
            alt={photo.filename} 
            className="hidden"
          />
        </a>
      ))}
    </div>
  );
};

export { Lightbox };
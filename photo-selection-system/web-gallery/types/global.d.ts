// types/global.d.ts

// Extend Window interface to include Lightbox from lightbox.js
declare global {
  interface Window {
    Lightbox?: {
      open(imageSet: Array<{ src: string; alt?: string; caption?: string }>, startIndex?: number, options?: object): void;
      close(): void;
      next(): void;
      prev(): void;
      initialize(): void;
    };
  }
}

export {};

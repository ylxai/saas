// types/lightbox.d.ts
declare module 'lightbox.js' {
  export interface LightboxImage {
    src: string;
    alt?: string;
    caption?: string;
  }

  export interface LightboxOptions {
    fade?: number;
    resizeDuration?: number;
    showImageNumberLabel?: boolean;
    alwaysShowNavOnTouchDevices?: boolean;
    wrapAround?: boolean;
  }

  export interface LightboxInstance {
    open(imageSet: LightboxImage[], startIndex?: number, options?: LightboxOptions): void;
    close(): void;
    next(): void;
    prev(): void;
    initialize(): void;
  }

  const Lightbox: LightboxInstance;
  export default Lightbox;
}
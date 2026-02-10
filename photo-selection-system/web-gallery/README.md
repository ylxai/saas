# Photo Selection Gallery

A powerful, mobile-first gallery application for photographers to allow clients to select photos for editing.

## Features

- **Mobile-First Design**: Optimized for iOS 15+ and Android 13+ with touch-friendly UI elements (minimum 44px touch targets)
- **Masonry Grid Layout**: Beautiful responsive grid for displaying photos
- **Lightbox Functionality**: Integrated lightbox for detailed photo viewing
- **Powerful Filtering**: Filter by event, file type, selection status, and search terms
- **Bulk Selection**: Select all, deselect all, or individual photo selection
- **Export Functionality**: Export selected photos for processing
- **Optimized for 3G/4G**: Designed to work efficiently on slower connections

## Tech Stack

- **Framework**: Next.js 15.5.9
- **Runtime**: Node.js 24+
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.0+
- **State Management**: Zustand
- **Validation**: Zod
- **Image Grid**: react-masonry-css
- **Lightbox**: lightgallery.js
- **Database**: NeonDB (PostgreSQL)
- **Storage**: Cloudflare R2

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Then edit .env.local with your configuration
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `DATABASE_URL`: Connection string for NeonDB
- `NEXT_PUBLIC_BASE_URL`: Base URL for the application
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Access key for Cloudflare R2
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Secret key for Cloudflare R2
- `CLOUDFLARE_R2_BUCKET_NAME`: Name of the R2 bucket

## API Endpoints

- `GET /api/photos?eventId=<eventId>`: Get photos for a specific event
- `GET /api/events`: Get all events
- `POST /api/export`: Export selected photos

## Mobile Compatibility

This application is optimized for:
- Safari Mobile (iOS 15+)
- Chrome Mobile (Android 13+)
- Responsive design for screens 320px and above
- Touch-friendly UI with minimum 44px touch targets
- Optimized for 3G/4G connections

## Deployment

Deploy to Vercel with zero configuration. The application is configured to remove body size limits for uploads.

## Architecture

The application follows a modular architecture with:
- Type-safe interfaces using TypeScript and Zod
- Centralized state management with Zustand
- Responsive design with Tailwind CSS
- Component-based UI architecture
- API routes for server-side operations
// lib/sanitize.ts
// Input sanitization utilities

/**
 * Sanitizes user input to prevent XSS and other injection attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove HTML tags and quotes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, 200); // Limit length to 200 characters
}

/**
 * Validates that input contains only alphanumeric characters, spaces, and common punctuation
 */
export function isValidSearchTerm(input: string): boolean {
  if (!input) return true;
  // Allow alphanumeric, spaces, hyphens, underscores, and dots
  const validPattern = /^[\w\s\-\.]*$/;
  return validPattern.test(input);
}

/**
 * Sanitizes filename to prevent directory traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  return filename
    .replace(/[\\/:*?"<>|]/g, '') // Remove invalid filename characters
    .replace(/\.\./g, '') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .trim()
    .slice(0, 255); // Limit filename length
}

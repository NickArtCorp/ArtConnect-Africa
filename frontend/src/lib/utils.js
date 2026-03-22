import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full URL for an image/media
 * Handles both external URLs (http/https) and local uploads (/uploads/...)
 */
export function getMediaUrl(url) {
  if (!url) return null;
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a local path, convert to /api/uploads/ path for proper routing
  if (url.startsWith('/uploads/')) {
    // Convert /uploads/... to /api/uploads/... for proper ingress routing
    const apiPath = url.replace('/uploads/', '/api/uploads/');
    return `${process.env.REACT_APP_BACKEND_URL}${apiPath}`;
  }
  
  // Default: return as is
  return url;
}

/**
 * Check if URL is a valid image that can be displayed
 */
export function isValidImageUrl(url) {
  if (!url) return false;
  
  // Check for common image extensions or known image services
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const imageServices = ['unsplash.com', 'dicebear.com', 'pexels.com', 'images.'];
  
  const lowerUrl = url.toLowerCase();
  
  // Check extensions
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Check known services
  if (imageServices.some(service => lowerUrl.includes(service))) {
    return true;
  }
  
  // Local uploads (both /uploads/ and /api/uploads/)
  if (url.startsWith('/uploads/') || url.startsWith('/api/uploads/')) {
    return true;
  }
  
  return false;
}

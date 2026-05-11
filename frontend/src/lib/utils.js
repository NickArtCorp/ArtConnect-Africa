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

/**
 * Translate sector name based on current language
 * @param {string} sectorName - English sector name
 * @param {Array} sectors - Reference sectors data from store
 * @param {string} language - Current language code ('en', 'fr', 'pt', 'es', 'ar', 'sw', 'af', 'mg', 'ti', 'so', 'am')
 * @returns {string} Translated sector name or original if not found
 */
export function translateSector(sectorName, sectors, language) {
  if (!sectorName || !sectors) return sectorName;
  
  if (language === 'en') return sectorName;
  
  const sector = sectors.find(s => s.name === sectorName);
  if (!sector) return sectorName;
  
  // Map language codes to field names
  const fieldMap = {
    'fr': 'name_fr', 'pt': 'name_pt', 'es': 'name_es', 'ar': 'name_ar',
    'sw': 'name_sw', 'af': 'name_af', 'mg': 'name_mg', 'ti': 'name_ti',
    'so': 'name_so', 'am': 'name_am'
  };
  
  const field = fieldMap[language];
  return field && sector[field] ? sector[field] : sectorName;
}

/**
 * Translate domain name based on current language
 * @param {string} domainName - English domain name
 * @param {Object} domains - Reference domains data from store
 * @param {string} sectorName - English sector name to find the right domain list
 * @param {string} language - Current language code ('en', 'fr', 'pt', 'es', 'ar', 'sw', 'af', 'mg', 'ti', 'so', 'am')
 * @returns {string} Translated domain name or original if not found
 */
export function translateDomain(domainName, domains, sectorName, language) {
  if (!domainName || !sectorName || !domains) return domainName;
  
  if (language === 'en') return domainName;
  
  const sectorDomains = domains[sectorName];
  if (!sectorDomains) return domainName;
  
  const domain = sectorDomains.find(d => d.name === domainName);
  if (!domain) return domainName;
  
  // Map language codes to field names
  const fieldMap = {
    'fr': 'name_fr', 'pt': 'name_pt', 'es': 'name_es', 'ar': 'name_ar',
    'sw': 'name_sw', 'af': 'name_af', 'mg': 'name_mg', 'ti': 'name_ti',
    'so': 'name_so', 'am': 'name_am'
  };
  
  const field = fieldMap[language];
  return field && domain[field] ? domain[field] : domainName;
}

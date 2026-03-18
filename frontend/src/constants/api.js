/**
 * Centralised API base URL.
 * All files should import from here instead of repeating the pattern inline.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

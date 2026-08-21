const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function mediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;

  const normalizedBaseUrl = API_URL.replace(/\/$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

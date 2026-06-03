import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Resolves a stored upload path (e.g. "/uploads/avatar-123.png") to a full URL
// pointing at the backend origin (API URL without the /api/v1 suffix).
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const origin = apiUrl.replace(/\/api\/v1\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize a search query to make it safe for use in database queries
 * Replaces any characters that could be used in SQL injection
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove special characters that could cause issues in SQL queries
  // Especially important for Supabase .or() filter strings
  return query.replace(/[\\%_'";:*()[\]{}=<>!@#$^&+|?~`]/g, '');
}

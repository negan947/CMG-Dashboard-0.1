import { z } from 'zod';

/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers with quotes
    .replace(/on\w+\s*=\s*[^"\s>]+/gi, '') // Remove event handlers without quotes
    .trim();
}

/**
 * Validate and sanitize SQL identifiers (table names, column names)
 * @param identifier - The SQL identifier to validate
 * @returns Validated identifier
 * @throws Error if identifier is invalid
 */
export function validateSqlIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  const valid = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
  
  if (!valid) {
    throw new Error('Invalid SQL identifier');
  }
  
  // Additional check for SQL keywords
  const sqlKeywords = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', 'UNION'];
  if (sqlKeywords.includes(identifier.toUpperCase())) {
    throw new Error('SQL keyword cannot be used as identifier');
  }
  
  return identifier;
}

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  orderBy: z.string().optional(),
  orderDirection: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Validate search parameters
 */
export const searchSchema = z.object({
  query: z.string().min(1).max(100).transform(sanitizeInput),
  filters: z.record(z.string()).optional(),
});

/**
 * Create a secure filename from user input
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace special chars with underscore (keep dots, hyphens, underscores)
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 255); // Limit length
}

/**
 * Validate and parse JSON safely
 */
export function safeJsonParse<T>(
  json: string,
  schema?: z.ZodSchema<T>
): { data?: T; error?: string } {
  try {
    const parsed = JSON.parse(json);
    
    if (schema) {
      const validated = schema.safeParse(parsed);
      if (!validated.success) {
        return { error: 'Invalid data format' };
      }
      return { data: validated.data };
    }
    
    return { data: parsed };
  } catch (error) {
    return { error: 'Invalid JSON' };
  }
}

/**
 * Check if a URL is safe to redirect to
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, process.env.NEXT_PUBLIC_APP_URL);
    
    // Only allow same-origin redirects
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    return parsed.origin === appUrl.origin;
  } catch {
    // If URL parsing fails, check if it's a relative path
    return url.startsWith('/') && !url.startsWith('//');
  }
} 
import { PostgrestError } from '@supabase/supabase-js';
import { AuthError } from '@/types/auth.types';

/**
 * Error factory for consistent error handling
 */
export class AppError extends Error implements AuthError {
  statusCode: number;
  errorCode?: string;
  
  constructor(message: string, statusCode = 500, errorCode?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    
    // Capture stack trace (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Factory for creating 404 not found errors 
 */
export const createNotFoundError = (resource: string): AuthError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Factory for creating unauthorized errors
 */
export const createUnauthorizedError = (message = 'Unauthorized request'): AuthError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

/**
 * Factory for creating validation errors
 */
export const createValidationError = (message: string): AuthError => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Parses Supabase errors into consistent format
 */
export const handleSupabaseError = (error: PostgrestError | Error | null): AuthError => {
  // Handle Supabase PostgrestError
  if (error && 'code' in error) {
    const postgrestError = error as PostgrestError;
    
    switch (postgrestError.code) {
      case '23505': // unique_violation
        return new AppError('A record with this information already exists.', 409, 'DUPLICATE_RECORD');
      case '23503': // foreign_key_violation
        return new AppError('Related record not found.', 400, 'FOREIGN_KEY_VIOLATION');
      case '42P01': // undefined_table
        return new AppError('Database table not found.', 500, 'TABLE_NOT_FOUND');
      case '42703': // undefined_column
        return new AppError('Database column not found.', 500, 'COLUMN_NOT_FOUND');
      default:
        return new AppError(
          postgrestError.message || 'An unexpected database error occurred',
          500,
          postgrestError.code
        );
    }
  }
  
  // Handle general errors
  if (error instanceof AppError) {
    return error;
  }
  
  return new AppError(
    error?.message || 'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  );
};

/**
 * Handle authentication errors from Supabase with user-friendly messages
 */
export const handleAuthError = (error: Error | null): AuthError => {
  if (!error) {
    return new AppError('An authentication error occurred. Please try again.', 500, 'AUTH_ERROR');
  }
  
  // Categorize auth errors by message patterns for user-friendly responses
  const message = error.message.toLowerCase();
  
  // Login errors
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    return new AppError(
      'The email or password you entered is incorrect. Please try again.', 
      401, 
      'INVALID_CREDENTIALS'
    );
  }
  
  if (message.includes('email not confirmed')) {
    return new AppError(
      'Please check your email and follow the confirmation link before signing in.', 
      401, 
      'EMAIL_NOT_CONFIRMED'
    );
  }
  
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return new AppError(
      'Too many login attempts detected. Please wait a moment before trying again.', 
      429, 
      'RATE_LIMITED'
    );
  }
  
  // Password errors
  if (message.includes('weak password')) {
    return new AppError(
      'Your password is too weak. Please create a stronger password with a mix of letters, numbers, and symbols.', 
      400, 
      'WEAK_PASSWORD'
    );
  }
  
  if (message.includes('password')) {
    if (message.includes('length')) {
      return new AppError(
        'Your password is too short. Please use at least 6 characters.', 
        400, 
        'PASSWORD_TOO_SHORT'
      );
    }
    
    if (message.includes('match')) {
      return new AppError(
        'Your passwords do not match. Please ensure both entries are identical.', 
        400, 
        'PASSWORDS_DONT_MATCH'
      );
    }
  }
  
  // Account-related errors
  if (message.includes('no user found') || message.includes('user not found')) {
    return new AppError(
      'We couldn\'t find an account with that email address. Please check your email or create a new account.', 
      404, 
      'USER_NOT_FOUND'
    );
  }
  
  if (message.includes('already exists') || message.includes('already in use')) {
    return new AppError(
      'This email is already registered. Please sign in or use a different email address.', 
      409, 
      'EMAIL_ALREADY_EXISTS'
    );
  }
  
  if (message.includes('reset password')) {
    return new AppError(
      'The password reset link has expired or is invalid. Please request a new password reset link.', 
      401, 
      'INVALID_RESET_TOKEN'
    );
  }
  
  // Session errors
  if (message.includes('session')) {
    if (message.includes('expired')) {
      return new AppError(
        'Your session has expired. Please sign in again to continue.', 
        401, 
        'SESSION_EXPIRED'
      );
    }
    
    if (message.includes('not found') || message.includes('invalid')) {
      return new AppError(
        'Your session is invalid. Please sign in again.', 
        401, 
        'INVALID_SESSION'
      );
    }
  }
  
  // Network or server errors
  if (message.includes('network') || message.includes('connection')) {
    return new AppError(
      'Network error detected. Please check your internet connection and try again.', 
      503, 
      'NETWORK_ERROR'
    );
  }
  
  if (message.includes('timeout')) {
    return new AppError(
      'The request timed out. Please try again when you have a more stable connection.', 
      504, 
      'TIMEOUT_ERROR'
    );
  }
  
  // Default error with original message for debugging, but friendly message for user
  console.error('Auth error:', error.message);
  return new AppError(
    'We encountered an issue while processing your request. Please try again later.', 
    500, 
    'AUTH_ERROR'
  );
}; 
import { Session, User, UserIdentity } from '@supabase/supabase-js';

/**
 * Enhanced User type with additional properties
 */
export interface AuthUser extends User {
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  identities?: UserIdentity[];
}

/**
 * Enhanced Session type
 */
export interface AuthSession extends Session {
  user: AuthUser;
}

/**
 * Auth State interface
 */
export interface AuthState {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth service response with enhanced error handling
 */
export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

/**
 * Structured Auth Error
 */
export interface AuthError extends Error {
  message: string;
  statusCode: number;
  errorCode?: string;
}

/**
 * Login response
 */
export interface LoginResponse extends AuthResponse<{
  session: AuthSession;
  user: AuthUser;
}> {}

/**
 * Registration response
 */
export interface SignUpResponse extends AuthResponse<{
  session: AuthSession | null;
  user: AuthUser | null;
}> {
  isEmailConfirmationRequired?: boolean;
  isExistingUser?: boolean;
}

/**
 * Roles within the system
 */
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

/**
 * User profile with additional information
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: UserRole;
  agencyId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session info with token details
 */
export interface SessionInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface PasswordResetResponse extends AuthResponse<null> {}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  password: string;
}

/**
 * Password update response
 */
export interface PasswordUpdateResponse extends AuthResponse<null> {} 
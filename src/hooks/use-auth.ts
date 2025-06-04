import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAuthContext } from '@/context/auth-provider';
import type { LoginFormValues, RegisterFormValues, ResetPasswordFormValues, UpdatePasswordFormValues } from '@/lib/schemas/auth-schemas';
import type { AuthUser, AuthSession } from '@/types/auth.types';
import { APP_ROUTES } from '@/lib/constants/routes';

/**
 * Custom hook for authentication throughout the app.
 * Provides a clean API and handles common auth patterns.
 */
export function useAuth() {
  const router = useRouter();
  const { isInitialized } = useAuthContext();
  
  const {
    user,
    session,
    isLoading,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    setError,
    clearState
  } = useAuthStore();


  /**
   * Log in a user and navigate to home on success
   */
  const login = useCallback(
    async (credentials: LoginFormValues) => {
      const result = await signIn(credentials);
      if (!result.error) {
        router.push(APP_ROUTES.DASHBOARD);
        router.refresh();
      }
      return result;
    },
    [signIn, router]
  );

  /**
   * Register a new user
   */
  const register = useCallback(
    async (credentials: RegisterFormValues) => {
      const result = await signUp(credentials);
      return result;
    },
    [signUp]
  );

  /**
   * Log out a user and navigate to login page
   */
  const logout = useCallback(
    async () => {
      const result = await signOut();
      if (!result.error) {
        router.push(APP_ROUTES.LOGIN);
        router.refresh();
      }
      return result;
    },
    [signOut, router]
  );

  /**
   * Request a password reset
   */
  const requestPasswordReset = useCallback(
    async (data: ResetPasswordFormValues) => {
      const result = await resetPassword(data);
      return result;
    },
    [resetPassword]
  );

  /**
   * Update the user's password
   */
  const changePassword = useCallback(
    async (data: UpdatePasswordFormValues) => {
      const result = await updatePassword(data);
      return result;
    },
    [updatePassword]
  );

  /**
   * Clear any auth-related errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Check if the user is authenticated
   */
  const isAuthenticated = !!user && !!session;

  // Fixed: Removed the incorrect date calculation that was causing issues
  const isAuthLoading = isLoading && !isInitialized;

  return {
    // Current state
    user: user as AuthUser | null,
    session: session as AuthSession | null,
    isLoading: isAuthLoading,
    error,
    isAuthenticated,
    initializationAttempted: isInitialized,
    
    // Actions
    login,
    register,
    logout,
    requestPasswordReset,
    changePassword,
    clearError,
    
    // For custom navigation logic
    initialize,
    clearState,
  };
} 
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser, AuthSession, AuthError } from '@/types/auth.types';
import { AuthService } from '@/services/auth-service';
import { LoginFormValues, RegisterFormValues, ResetPasswordFormValues, UpdatePasswordFormValues } from '@/lib/schemas/auth-schemas';

/**
 * Extended auth state with actions
 */
interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  signIn: (credentials: LoginFormValues) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: RegisterFormValues) => Promise<{ error: AuthError | null, isEmailConfirmationRequired: boolean, isExistingUser: boolean }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (data: ResetPasswordFormValues) => Promise<{ error: AuthError | null }>;
  updatePassword: (data: UpdatePasswordFormValues) => Promise<{ error: AuthError | null }>;
  setSession: (session: AuthSession | null) => void;
  setUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

// Maximum time to wait for initialization in milliseconds
const MAX_INIT_TIME = 5000;

/**
 * Centralized auth store using Zustand with persist middleware
 * This will keep auth state synchronized and persisted across the application
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: false,
      error: null,

      /**
       * Initialize auth state by fetching current session
       */
      initialize: async () => {
        // Set a timeout to avoid getting stuck in loading state
        const timeoutId = setTimeout(() => {
          const { isLoading } = get();
          if (isLoading) {
            console.warn('Auth initialization timeout after ' + MAX_INIT_TIME + 'ms');
            set({ isLoading: false, error: 'Authentication timed out. Please try again.' });
          }
        }, MAX_INIT_TIME);

        try {
          set({ isLoading: true, error: null });
          const { session, error } = await AuthService.getSession();
          
          if (error) {
            set({ error: error.message, isLoading: false });
            clearTimeout(timeoutId);
            return;
          }
          
          // If no session, just clear loading state
          if (!session) {
            set({ isLoading: false });
            clearTimeout(timeoutId);
            return;
          }
          
          // Get user details if needed
          if (!get().user) {
            try {
              const { user } = await AuthService.getUser();
              set({ user });
            } catch (userError) {
              console.error('Failed to get user details:', userError);
              // Continue even without user details, just log error
            }
          }
          
          set({ session, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize auth store:', error);
          set({ error: 'Authentication initialization failed', isLoading: false });
        } finally {
          clearTimeout(timeoutId);
        }
      },

      /**
       * Sign in user with email and password
       */
      signIn: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await AuthService.signIn(credentials);
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { error };
          }
          
          set({ 
            user: data?.user || null, 
            session: data?.session || null,
            isLoading: false 
          });
          
          return { error: null };
        } catch (error) {
          console.error('Sign in error:', error);
          set({ error: 'Sign in failed', isLoading: false });
          return { error: { message: 'Sign in failed', statusCode: 500 } };
        }
      },

      /**
       * Register a new user
       */
      signUp: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error, isEmailConfirmationRequired, isExistingUser } = await AuthService.signUp(credentials);
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { error, isEmailConfirmationRequired: false, isExistingUser: false };
          }
          
          // If direct sign-in is allowed (no email confirmation), set the session and user
          if (data?.session && data?.user) {
            set({ 
              user: data.user, 
              session: data.session,
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          return { 
            error: null, 
            isEmailConfirmationRequired: isEmailConfirmationRequired || false,
            isExistingUser: isExistingUser || false
          };
        } catch (error) {
          console.error('Sign up error:', error);
          set({ error: 'Sign up failed', isLoading: false });
          return { 
            error: { message: 'Sign up failed', statusCode: 500 },
            isEmailConfirmationRequired: false,
            isExistingUser: false
          };
        }
      },

      /**
       * Sign out current user
       */
      signOut: async () => {
        try {
          set({ isLoading: true });
          const { error } = await AuthService.signOut();
          
          if (error) {
            set({ error: error.message, isLoading: false });
            return { error };
          }
          
          // Clear auth state on successful sign out
          get().clearState();
          return { error: null };
        } catch (error) {
          console.error('Sign out error:', error);
          set({ error: 'Sign out failed', isLoading: false });
          return { error: { message: 'Sign out failed', statusCode: 500 } };
        }
      },

      /**
       * Request password reset
       */
      resetPassword: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await AuthService.resetPassword(data);
          
          set({ isLoading: false });
          
          if (error) {
            set({ error: error.message });
            return { error };
          }
          
          return { error: null };
        } catch (error) {
          console.error('Password reset error:', error);
          set({ error: 'Password reset failed', isLoading: false });
          return { error: { message: 'Password reset failed', statusCode: 500 } };
        }
      },

      /**
       * Update user's password
       */
      updatePassword: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await AuthService.updatePassword(data);
          
          set({ isLoading: false });
          
          if (error) {
            set({ error: error.message });
            return { error };
          }
          
          return { error: null };
        } catch (error) {
          console.error('Password update error:', error);
          set({ error: 'Password update failed', isLoading: false });
          return { error: { message: 'Password update failed', statusCode: 500 } };
        }
      },

      /**
       * Set current session
       */
      setSession: (session) => set({ session }),

      /**
       * Set current user
       */
      setUser: (user) => set({ user }),

      /**
       * Set error message
       */
      setError: (error) => set({ error }),

      /**
       * Clear auth state (used for sign out)
       */
      clearState: () => set({ 
        user: null, 
        session: null, 
        error: null, 
        isLoading: false 
      })
    }),
    {
      name: 'auth-storage', // name for localStorage item
      partialize: (state) => ({ user: state.user, session: state.session }), // only persist these fields
    }
  )
); 
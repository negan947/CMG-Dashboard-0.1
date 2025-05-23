import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, AuthUser, AuthSession, AuthError } from '@/types/auth.types';
import { AuthService } from '@/services/auth-service';
import { LoginFormValues, RegisterFormValues, ResetPasswordFormValues, UpdatePasswordFormValues } from '@/lib/schemas/auth-schemas';
import { handleAuthError } from '@/lib/error-handling';

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
            const friendlyError = handleAuthError(new Error('Authentication timed out. Please try again.'));
            set({ isLoading: false, error: friendlyError.message });
          }
        }, MAX_INIT_TIME);

        try {
          set({ isLoading: true, error: null });
          const { session, error: supabaseError } = await AuthService.getSession();
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message, isLoading: false });
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
            } catch (userError: any) {
              console.error('Failed to get user details:', userError);
              // Continue even without user details, just log error
              // Optionally, you could set a non-critical error message here using handleAuthError if appropriate
            }
          }
          
          set({ session, isLoading: false });
        } catch (error: any) {
          console.error('Failed to initialize auth store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
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
          const { data, error: supabaseError } = await AuthService.signIn(credentials);
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message, isLoading: false });
            return { error: friendlyError };
          }
          
          set({ 
            user: data?.user || null, 
            session: data?.session || null,
            isLoading: false 
          });
          
          return { error: null };
        } catch (error: any) {
          console.error('Sign in error in store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
          return { error: friendlyError };
        }
      },

      /**
       * Register a new user
       */
      signUp: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error: supabaseError, isEmailConfirmationRequired, isExistingUser } = await AuthService.signUp(credentials);
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message, isLoading: false });
            return { error: friendlyError, isEmailConfirmationRequired: false, isExistingUser: !!isExistingUser };
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
        } catch (error: any) {
          console.error('Sign up error in store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
          return { 
            error: friendlyError,
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
          set({ isLoading: true }); // Don't clear error here, let AuthService handle it
          const { error: supabaseError } = await AuthService.signOut();
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message, isLoading: false });
            return { error: friendlyError };
          }
          
          // Clear auth state on successful sign out
          get().clearState(); // This will also clear any previous errors
          return { error: null };
        } catch (error: any) {
          console.error('Sign out error in store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
          return { error: friendlyError };
        }
      },

      /**
       * Request password reset
       */
      resetPassword: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const { error: supabaseError } = await AuthService.resetPassword(data);
          
          set({ isLoading: false }); // Clear loading regardless of error
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message }); // Set error message
            return { error: friendlyError };
          }
          
          return { error: null };
        } catch (error: any) {
          console.error('Password reset error in store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
          return { error: friendlyError };
        }
      },

      /**
       * Update user's password
       */
      updatePassword: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const { error: supabaseError } = await AuthService.updatePassword(data);
          
          set({ isLoading: false }); // Clear loading regardless of error
          
          if (supabaseError) {
            const friendlyError = handleAuthError(supabaseError as Error | null);
            set({ error: friendlyError.message }); // Set error message
            return { error: friendlyError };
          }
          
          return { error: null };
        } catch (error: any) {
          console.error('Password update error in store:', error);
          const friendlyError = handleAuthError(error);
          set({ error: friendlyError.message, isLoading: false });
          return { error: friendlyError };
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
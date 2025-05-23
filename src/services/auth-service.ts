import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  LoginFormValues, 
  RegisterFormValues, 
  ResetPasswordFormValues, 
  UpdatePasswordFormValues 
} from '@/lib/schemas/auth-schemas';
import { AuthUser, AuthSession, AuthError } from '@/types/auth.types';

/**
 * Logger utility for consistent logging with context
 */
const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.info(`[AUTH] ${message}`, context ? context : '');
  },
  error: (message: string, error: any, context?: Record<string, any>) => {
    console.error(`[AUTH ERROR] ${message}`, error, context ? context : '');
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[AUTH WARNING] ${message}`, context ? context : '');
  },
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[AUTH DEBUG] ${message}`, context ? context : '');
    }
  }
};

/**
 * Service for handling all authentication-related API calls
 */
export class AuthService {
  /**
   * Get the current session
   */
  static async getSession() {
    try {
      console.log('Getting session...');
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return { session: null, error: error };
      }
      
      if (!data?.session) {
        console.log('No active session found');
        return { session: null, error: null };
      }
      
      console.log('Session found for user:', data.session.user.email);
      return { session: data.session as AuthSession, error: null };
    } catch (error) {
      console.error('Unexpected error getting session:', error);
      return { 
        session: null, 
        error: { message: 'Failed to get session', statusCode: 500 } as AuthError
      };
    }
  }

  /**
   * Get the current user
   */
  static async getUser() {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data } = await supabase.auth.getUser();
      
      if (!data?.user) {
        return { user: null };
      }
      
      return { user: data.user as AuthUser };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(credentials: LoginFormValues) {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        return { 
          data: null, 
          error: error
        };
      }
      
      return { 
        data: {
          user: data.user as AuthUser,
          session: data.session as AuthSession
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   */
  static async signUp(credentials: RegisterFormValues) {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      
      // Check if a user with this email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', credentials.email)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing user:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        return {
          data: null,
          error: { message: 'A user with this email already exists', statusCode: 409 },
          isEmailConfirmationRequired: false,
          isExistingUser: true
        };
      }
      
      // If no existing user, proceed with sign up
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.email?.split('@')[0]
          }
        }
      });
      
      if (error) {
        return { 
          data: null, 
          error: error,
          isEmailConfirmationRequired: false,
          isExistingUser: false
        };
      }
      
      // Check if email confirmation is required
      const isEmailConfirmationRequired = data?.user?.identities?.length === 0 || 
                                         data?.user?.confirmed_at === null;
      
      return { 
        data: {
          user: data?.user as AuthUser | null,
          session: data?.session as AuthSession | null
        }, 
        error: null,
        isEmailConfirmationRequired,
        isExistingUser: false
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(data: ResetPasswordFormValues) {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(data: UpdatePasswordFormValues) {
    try {
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
} 
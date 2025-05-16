import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  ProfileUpdateFormValues,
  SocialLinksFormValues,
  UserPreferencesFormValues,
} from '@/lib/schemas/profile-schemas';
import { toast } from 'sonner';

/**
 * Service for handling all profile-related API calls
 */
export class ProfileService {
  
  /**
   * Get user profile information
   */
  static async getProfile(userId: string) {
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Special handling for "not found" error - this is expected for new users
      if (error && error.code === 'PGRST116') {
        console.log('Profile not found, this is normal for new users');
        return { profile: null, error: null };
      }
      
      if (error) {
        console.error('Error getting profile:', error);
        return { profile: null, error };
      }
      
      return { profile: data, error: null };
    } catch (error) {
      console.error('Unexpected error getting profile:', error);
      return { 
        profile: null, 
        error: { message: 'Failed to fetch profile', statusCode: 500 } 
      };
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string) {
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "row not found"
        console.error('Error getting user preferences:', error);
        return { preferences: null, error };
      }
      
      return { preferences: data || {}, error: null };
    } catch (error) {
      console.error('Unexpected error getting user preferences:', error);
      return { 
        preferences: null, 
        error: { message: 'Failed to fetch user preferences', statusCode: 500 } 
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, profileData: ProfileUpdateFormValues) {
    try {
      const supabase = createClientComponentClient();
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      // Handle potential error from the check operation
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile existence:', checkError);
        return { success: false, error: checkError };
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', userId);
      } else {
        // Insert new profile with user_id
        result = await supabase
          .from('profiles')
          .insert({ 
            ...profileData, 
            user_id: userId,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating profile:', result.error);
        return { success: false, error: result.error };
      }
      
      // Log this action
      await this.logSecurityAction(userId, 'profile_update', 'Profile information updated');
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update profile', statusCode: 500 } 
      };
    }
  }

  /**
   * Update user's social links
   */
  static async updateSocialLinks(userId: string, socialLinks: SocialLinksFormValues) {
    try {
      const supabase = createClientComponentClient();
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, social_links')
        .eq('user_id', userId)
        .single();
      
      // Handle potential error from the check operation
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile existence:', checkError);
        return { success: false, error: checkError };
      }
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({ social_links: socialLinks })
          .eq('user_id', userId);
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert({ 
            user_id: userId, 
            social_links: socialLinks,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating social links:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating social links:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update social links', statusCode: 500 } 
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: UserPreferencesFormValues) {
    try {
      const supabase = createClientComponentClient();
      
      // Check if preferences record exists
      const { data: existingPreferences } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingPreferences) {
        // Update existing preferences
        result = await supabase
          .from('user_preferences')
          .update(preferences)
          .eq('user_id', userId);
      } else {
        // Insert new preferences
        result = await supabase
          .from('user_preferences')
          .insert({ ...preferences, user_id: userId });
      }
      
      if (result.error) {
        console.error('Error updating user preferences:', result.error);
        return { success: false, error: result.error };
      }
      
      await this.logSecurityAction(userId, 'preferences_update', 'User preferences updated');
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating user preferences:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update user preferences', statusCode: 500 } 
      };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(currentPassword: string, newPassword: string) {
    try {
      const supabase = createClientComponentClient();

      // Use Supabase auth API to update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        return { success: false, error };
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log this security-sensitive action
        await this.logSecurityAction(user.id, 'password_change', 'Password was changed');
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating password:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update password', statusCode: 500 } 
      };
    }
  }

  /**
   * Log security actions for audit trail
   */
  static async logSecurityAction(userId: string, actionType: string, description: string) {
    try {
      const supabase = createClientComponentClient();
      
      await supabase
        .from('security_logs')
        .insert({
          user_id: userId,
          action_type: actionType,
          description,
          // We don't have access to IP and user agent on the client side in a secure way,
          // So we're leaving these out for now
        });
        
      return { success: true };
    } catch (error) {
      console.error('Error logging security action:', error);
      return { success: false };
    }
  }

  /**
   * Get security logs for a user
   */
  static async getSecurityLogs(userId: string, limit = 10) {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error getting security logs:', error);
        return { logs: [], error };
      }
      
      return { logs: data || [], error: null };
    } catch (error) {
      console.error('Unexpected error getting security logs:', error);
      return { 
        logs: [], 
        error: { message: 'Failed to fetch security logs', statusCode: 500 } 
      };
    }
  }

  /**
   * Get user core data from public users table (including agency_id)
   * @param userEmail - The email from auth.users
   */
  static async getUserData(userEmail: string) {
    if (!userEmail) {
        console.warn('getUserData called without email');
        return { agencyId: null, error: { message: 'User email is required'} };
    }
    try {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('users') 
        .select('agency_id') 
        .eq('email', userEmail) // Use email to match
        .single(); 
      
      if (error && error.code !== 'PGRST116') { 
        console.error('Error getting user data:', error);
        return { agencyId: null, error };
      }

      if (error && error.code === 'PGRST116') { 
        console.warn('User not found in public users table by email:', userEmail);
        return { agencyId: null, error: null };
      } 
      
      if (!data?.agency_id) {
          console.warn('Agency ID not found in users table for email:', userEmail);
          return { agencyId: null, error: null };
      }
      
      // Ensure agencyId is a number before returning
      const agencyIdNum = parseInt(String(data.agency_id), 10);
      if (isNaN(agencyIdNum)) {
         console.warn('Agency ID found but is not a valid number for email:', userEmail, data.agency_id);
         return { agencyId: null, error: null };
      }

      return { agencyId: agencyIdNum, error: null };
    } catch (error) {
      console.error('Unexpected error getting user data:', error);
      return { 
        agencyId: null, 
        error: { message: 'Failed to fetch user data', statusCode: 500 } 
      };
    }
  }

  /**
   * Get user's agency membership - NO LONGER NEEDED IF users table has agency_id
   */
  // static async getAgencyMembership(userId: string) { ... }
} 
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ProfileService } from '@/services/profile-service';
import { toast } from 'sonner';
import { 
  ProfileUpdateFormValues,
  SocialLinksFormValues,
  UserPreferencesFormValues,
  PasswordChangeFormValues
} from '@/lib/schemas/profile-schemas';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile data
  const initializeProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get profile data
      const { profile, error: profileError } = await ProfileService.getProfile(user.id);
      
      if (profileError) {
        console.error('Error loading profile:', profileError);
        setError(profileError.message || 'Failed to load profile data');
      } else {
        setProfile(profile || {}); // Use empty object if profile is null
      }
      
      // Get user preferences
      const { preferences, error: preferencesError } = await ProfileService.getUserPreferences(user.id);
      
      if (preferencesError) {
        console.error('Error loading preferences:', preferencesError);
      } else {
        setPreferences(preferences || {}); // Use empty object if preferences is null
      }
      
      // Get security logs
      const { logs, error: logsError } = await ProfileService.getSecurityLogs(user.id);
      
      if (logsError) {
        console.error('Error loading security logs:', logsError);
      } else {
        setSecurityLogs(logs || []); // Use empty array if logs is null
      }
    } catch (err: any) {
      console.error('Unexpected error loading profile data:', err);
      setError(err?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load profile data on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      initializeProfile();
    } else {
      // Reset states when user is not available
      setProfile(null);
      setPreferences(null);
      setSecurityLogs([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id, initializeProfile]);

  // Update profile information
  const updateProfile = async (data: ProfileUpdateFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to update your profile');
      return { success: false };
    }
    
    try {
      const { success, error } = await ProfileService.updateProfile(user.id, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update profile');
        return { success: false, error };
      }
      
      // Refresh profile data
      await initializeProfile();
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update social links
  const updateSocialLinks = async (data: SocialLinksFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to update your social links');
      return { success: false };
    }
    
    try {
      const { success, error } = await ProfileService.updateSocialLinks(user.id, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update social links');
        return { success: false, error };
      }
      
      // Refresh profile data
      await initializeProfile();
      
      toast.success('Social links updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating social links:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update user preferences
  const updatePreferences = async (data: UserPreferencesFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to update your preferences');
      return { success: false };
    }
    
    try {
      const { success, error } = await ProfileService.updateUserPreferences(user.id, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update preferences');
        return { success: false, error };
      }
      
      // Refresh preferences data
      await initializeProfile();
      
      toast.success('Preferences updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Change password
  const changePassword = async (data: PasswordChangeFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to change your password');
      return { success: false };
    }
    
    try {
      const { success, error } = await ProfileService.updatePassword(
        data.current_password,
        data.new_password
      );
      
      if (error) {
        toast.error(error.message || 'Failed to change password');
        return { success: false, error };
      }
      
      // Refresh security logs
      const { logs } = await ProfileService.getSecurityLogs(user.id);
      setSecurityLogs(logs || []);
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error changing password:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  return {
    // State
    profile,
    preferences,
    securityLogs,
    isLoading,
    error,
    
    // Actions
    initializeProfile,
    updateProfile,
    updateSocialLinks,
    updatePreferences,
    changePassword,
  };
} 
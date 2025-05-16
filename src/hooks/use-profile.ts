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
  const [currentAgencyId, setCurrentAgencyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize profile data
  const initializeProfile = useCallback(async () => {
    // Ensure we have user and user.email before proceeding
    if (!user?.id || !user?.email) {
      console.warn('initializeProfile: user ID or email missing', user);
      setIsLoading(false); // Stop loading if no user/email
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentAgencyId(null);
    
    try {
      const [profileResult, preferencesResult, logsResult, userDataResult] = await Promise.all([
        ProfileService.getProfile(user.id),
        ProfileService.getUserPreferences(user.id),
        ProfileService.getSecurityLogs(user.id),
        ProfileService.getUserData(user.email) // Pass user.email here
      ]);

      const { profile, error: profileError } = profileResult;
      const { preferences, error: preferencesError } = preferencesResult;
      const { logs, error: logsError } = logsResult;
      const { agencyId, error: userDataError } = userDataResult; // Destructure user data result

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setError(prev => prev || 'Failed to load profile data');
      } else {
        setProfile(profile || {});
      }
      
      if (preferencesError) {
        console.error('Error loading preferences:', preferencesError);
        setError(prev => prev || 'Failed to load preferences');
      } else {
        setPreferences(preferences || {});
      }
      
      if (logsError) {
        console.error('Error loading security logs:', logsError);
        setError(prev => prev || 'Failed to load security logs');
      } else {
        setSecurityLogs(logs || []);
      }

      if (userDataError) { // Handle user data fetch error
        console.error('Error loading user data (for agencyId):', userDataError);
        setError(prev => prev || 'Failed to load agency information');
        setCurrentAgencyId(null);
      } else {
        setCurrentAgencyId(agencyId); // Set the agencyId state from userDataResult
      }

    } catch (err: any) {
      console.error('Unexpected error loading profile data:', err);
      setError(err?.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  // Load profile data on mount and when user changes
  useEffect(() => {
    if (user?.id && user?.email) {
      initializeProfile();
    } else {
      // Reset states when user is not available
      setProfile(null);
      setPreferences(null);
      setSecurityLogs([]);
      setCurrentAgencyId(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user?.id, user?.email, initializeProfile]);

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
    currentAgencyId,
    
    // Actions
    initializeProfile,
    updateProfile,
    updateSocialLinks,
    updatePreferences,
    changePassword,
  };
} 
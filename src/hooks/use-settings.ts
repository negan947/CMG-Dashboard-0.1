import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SettingsService } from '@/services/settings-service';
import { toast } from 'sonner';
import {
  GeneralSettingsFormValues,
  BillingSettingsFormValues,
  NotificationSettingsFormValues,
  TeamSettingsFormValues,
  SecuritySettingsFormValues,
  IntegrationSettingsFormValues,
  TeamMemberFormValues
} from '@/lib/schemas/settings-schemas';

export function useSettings() {
  const { user } = useAuth();
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [generalSettings, setGeneralSettings] = useState<any>({});
  const [billingSettings, setBillingSettings] = useState<any>({});
  const [notificationSettings, setNotificationSettings] = useState<any>({});
  const [teamSettings, setTeamSettings] = useState<any>({});
  const [securitySettings, setSecuritySettings] = useState<any>({});
  const [integrationSettings, setIntegrationSettings] = useState<any>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean>(true);
  const [permissionIssue, setPermissionIssue] = useState<boolean>(false);

  // Determine the agency ID from the user
  useEffect(() => {
    if (user) {
      // In a real app, we would get this from user metadata or a join table
      // For now, we'll use the user ID as the agency ID for simplicity
      setAgencyId(user.id);
    } else {
      setAgencyId(null);
    }
  }, [user]);

  // Initialize settings data
  const initializeSettings = useCallback(async () => {
    if (!agencyId) return;
    
    setIsLoading(true);
    setError(null);
    setPermissionIssue(false);
    
    try {
      // First check if tables exist
      const { tablesExist: exist, error: tableCheckError } = 
        await SettingsService.checkTablesExist();
      
      setTablesExist(exist);
      
      if (!exist) {
        console.log('Settings tables do not exist yet. Using default empty settings.');
        setIsLoading(false);
        return;
      }
      
      if (tableCheckError) {
        console.error('Error checking if tables exist:', tableCheckError);
        
        // Check if this is a permission issue
        if (typeof tableCheckError === 'object' && tableCheckError !== null &&
            ((tableCheckError as any).code === 'PGRST403' || 
             (tableCheckError as any).status === 403 || 
             (tableCheckError as any).status === 500)) {
          console.log('Permission issue detected when checking tables.');
          setPermissionIssue(true);
          setError('You do not have permission to access these settings.');
          setIsLoading(false);
          return;
        }
        
        setError('Could not check if database tables exist. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Fetch general settings
      const { settings: general, error: generalError } = 
        await SettingsService.getGeneralSettings(agencyId);
      
      if (generalError && typeof generalError === 'object' && generalError !== null && (generalError as any).code !== 'PGRST116') {
        console.error('Error loading general settings:', generalError);
        
        // Check if this is a permission issue
        if ((generalError as any).code === 'PGRST403' || (generalError as any).status === 403 || (generalError as any).status === 500) {
          console.log('Permission issue detected when loading general settings.');
          setPermissionIssue(true);
          setError('You do not have permission to access these settings.');
          return;
        }
      }
      
      setGeneralSettings(general || {});
      
      // Only continue loading other settings if we don't have a permission issue
      if (!permissionIssue) {
        // Fetch billing settings
        const { settings: billing, error: billingError } = 
          await SettingsService.getBillingSettings(agencyId);
        
        if (billingError && typeof billingError === 'object' && billingError !== null && (billingError as any).code !== 'PGRST116') {
          console.error('Error loading billing settings:', billingError);
          
          // Check if this is a permission issue
          if ((billingError as any).code === 'PGRST403' || (billingError as any).status === 403 || (billingError as any).status === 500) {
            console.log('Permission issue detected when loading billing settings.');
            setPermissionIssue(true);
          }
        }
        
        setBillingSettings(billing || {});
        
        // Fetch notification settings
        const { settings: notification, error: notificationError } = 
          await SettingsService.getNotificationSettings(agencyId);
        
        if (notificationError && typeof notificationError === 'object' && notificationError !== null && (notificationError as any).code !== 'PGRST116') {
          console.error('Error loading notification settings:', notificationError);
          
          // Check if this is a permission issue
          if ((notificationError as any).code === 'PGRST403' || (notificationError as any).status === 403 || (notificationError as any).status === 500) {
            console.log('Permission issue detected when loading notification settings.');
            setPermissionIssue(true);
          }
        }
        
        setNotificationSettings(notification || {});
        
        // Fetch team settings
        const { settings: team, error: teamError } = 
          await SettingsService.getTeamSettings(agencyId);
        
        if (teamError && typeof teamError === 'object' && teamError !== null && (teamError as any).code !== 'PGRST116') {
          console.error('Error loading team settings:', teamError);
          
          // Check if this is a permission issue
          if ((teamError as any).code === 'PGRST403' || (teamError as any).status === 403 || (teamError as any).status === 500) {
            console.log('Permission issue detected when loading team settings.');
            setPermissionIssue(true);
          }
        }
        
        setTeamSettings(team || {});
        
        // Fetch security settings
        const { settings: security, error: securityError } = 
          await SettingsService.getSecuritySettings(agencyId);
        
        if (securityError && typeof securityError === 'object' && securityError !== null && (securityError as any).code !== 'PGRST116') {
          console.error('Error loading security settings:', securityError);
          
          // Check if this is a permission issue
          if ((securityError as any).code === 'PGRST403' || (securityError as any).status === 403 || (securityError as any).status === 500) {
            console.log('Permission issue detected when loading security settings.');
            setPermissionIssue(true);
          }
        }
        
        setSecuritySettings(security || {});
        
        // Fetch integration settings
        const { settings: integration, error: integrationError } = 
          await SettingsService.getIntegrationSettings(agencyId);
        
        if (integrationError && typeof integrationError === 'object' && integrationError !== null && (integrationError as any).code !== 'PGRST116') {
          console.error('Error loading integration settings:', integrationError);
          
          // Check if this is a permission issue
          if ((integrationError as any).code === 'PGRST403' || (integrationError as any).status === 403 || (integrationError as any).status === 500) {
            console.log('Permission issue detected when loading integration settings.');
            setPermissionIssue(true);
          }
        }
        
        setIntegrationSettings(integration || {});
        
        // Fetch team members
        const { members, error: membersError } = 
          await SettingsService.getTeamMembers(agencyId);
        
        if (membersError && typeof membersError === 'object' && membersError !== null && (membersError as any).code !== 'PGRST116') {
          console.error('Error loading team members:', membersError);
          
          // Check if this is a permission issue
          if ((membersError as any).code === 'PGRST403' || (membersError as any).status === 403 || (membersError as any).status === 500) {
            console.log('Permission issue detected when loading team members.');
            setPermissionIssue(true);
          }
        }
        
        setTeamMembers(members || []);
      }
      
      // Set an error message if we detected permission issues
      if (permissionIssue) {
        setError('You do not have permission to access these settings. Contact an administrator for assistance.');
      }
      
    } catch (err: any) {
      console.error('Unexpected error loading settings data:', err);
      
      // Don't show error if tables don't exist yet
      if (err.status === 404) {
        console.log('Tables may not exist yet. Using default empty settings.');
        setTablesExist(false);
      } else if (err.status === 403 || err.status === 500) {
        // This is likely a permission issue
        console.log('Permission issue detected in catch block.');
        setPermissionIssue(true);
        setError('You may not have permission to access these settings. Contact an administrator for assistance.');
      } else {
        setError(err?.message || 'Failed to load settings data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [agencyId, permissionIssue]);

  // Load settings data on mount and when agency ID changes
  useEffect(() => {
    if (agencyId) {
      initializeSettings();
    } else {
      // Reset states when user is not available
      setGeneralSettings({});
      setBillingSettings({});
      setNotificationSettings({});
      setTeamSettings({});
      setSecuritySettings({});
      setIntegrationSettings({});
      setTeamMembers([]);
      setIsLoading(false);
      setError(null);
      setTablesExist(true); // Reset tables exist state
      setPermissionIssue(false); // Reset permission issue state
    }
  }, [agencyId, initializeSettings]);

  // Update general settings
  const updateGeneralSettings = async (data: GeneralSettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      if (!tablesExist) {
        toast.error('Settings tables do not exist yet. Please contact an administrator.');
        return { success: false };
      }
      
      if (permissionIssue) {
        toast.error('You do not have permission to update these settings.');
        return { success: false };
      }
      
      const { success, error } = await SettingsService.updateGeneralSettings(agencyId, data);
      
      if (error) {
        if (typeof error === 'object' && error !== null && 'statusCode' in error && (error as any).statusCode === 404) {
          toast.error('Settings database tables do not exist yet. Please contact an administrator.');
          setTablesExist(false);
        } else if (typeof error === 'object' && error !== null && 'statusCode' in error && 
                 ((error as any).statusCode === 403 || (error as any).statusCode === 500)) {
          toast.error('You do not have permission to update these settings.');
          setPermissionIssue(true);
        } else {
          toast.error((typeof error === 'object' && error !== null && 'message' in error) ? 
                     (error as any).message : 'Failed to update general settings');
        }
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('General settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating general settings:', err);
      
      if (err.status === 404) {
        toast.error('Settings database tables do not exist yet. Please contact an administrator.');
        setTablesExist(false);
      } else if (err.status === 403 || err.status === 500) {
        toast.error('You do not have permission to update these settings.');
        setPermissionIssue(true);
      } else {
        toast.error(err?.message || 'An unexpected error occurred');
      }
      
      return { success: false };
    }
  };

  // Update billing settings
  const updateBillingSettings = async (data: BillingSettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateBillingSettings(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update billing settings');
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('Billing settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating billing settings:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (data: NotificationSettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateNotificationSettings(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update notification settings');
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('Notification settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating notification settings:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update team settings
  const updateTeamSettings = async (data: TeamSettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateTeamSettings(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update team settings');
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('Team settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating team settings:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update security settings
  const updateSecuritySettings = async (data: SecuritySettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateSecuritySettings(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update security settings');
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('Security settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating security settings:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update integration settings
  const updateIntegrationSettings = async (data: IntegrationSettingsFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update settings');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateIntegrationSettings(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update integration settings');
        return { success: false, error };
      }
      
      // Refresh settings data
      await initializeSettings();
      
      toast.success('Integration settings updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating integration settings:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Invite team member
  const inviteTeamMember = async (data: TeamMemberFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to invite team members');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.inviteTeamMember(agencyId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to invite team member');
        return { success: false, error };
      }
      
      // Refresh team members data
      const { members } = await SettingsService.getTeamMembers(agencyId);
      setTeamMembers(members || []);
      
      toast.success('Team member invited successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error inviting team member:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Update team member
  const updateTeamMember = async (memberId: string, data: TeamMemberFormValues) => {
    if (!agencyId) {
      toast.error('You must be logged in to update team members');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.updateTeamMember(agencyId, memberId, data);
      
      if (error) {
        toast.error(error.message || 'Failed to update team member');
        return { success: false, error };
      }
      
      // Refresh team members data
      const { members } = await SettingsService.getTeamMembers(agencyId);
      setTeamMembers(members || []);
      
      toast.success('Team member updated successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error updating team member:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  // Remove team member
  const removeTeamMember = async (memberId: string) => {
    if (!agencyId) {
      toast.error('You must be logged in to remove team members');
      return { success: false };
    }
    
    try {
      const { success, error } = await SettingsService.removeTeamMember(agencyId, memberId);
      
      if (error) {
        toast.error(error.message || 'Failed to remove team member');
        return { success: false, error };
      }
      
      // Refresh team members data
      const { members } = await SettingsService.getTeamMembers(agencyId);
      setTeamMembers(members || []);
      
      toast.success('Team member removed successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error removing team member:', err);
      toast.error(err?.message || 'An unexpected error occurred');
      return { success: false };
    }
  };

  return {
    // State
    agencyId,
    generalSettings,
    billingSettings,
    notificationSettings,
    teamSettings,
    securitySettings,
    integrationSettings,
    teamMembers,
    isLoading,
    error,
    tablesExist,
    permissionIssue,
    
    // Actions
    initializeSettings,
    updateGeneralSettings,
    updateBillingSettings,
    updateNotificationSettings,
    updateTeamSettings,
    updateSecuritySettings,
    updateIntegrationSettings,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember,
  };
} 
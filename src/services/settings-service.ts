import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  GeneralSettingsFormValues,
  BillingSettingsFormValues,
  NotificationSettingsFormValues,
  TeamSettingsFormValues,
  SecuritySettingsFormValues,
  IntegrationSettingsFormValues,
  TeamMemberFormValues
} from '@/lib/schemas/settings-schemas';
import { toast } from 'sonner';

/**
 * Service for handling all settings-related API calls
 */
export class SettingsService {
  
  /**
   * Check if settings-related tables exist
   */
  static async checkTablesExist() {
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
      
      // Try querying the agency_settings table
      const { count, error } = await supabase
        .from('agency_settings')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error checking if settings tables exist:', error);
        
        if (error.code === '404' || error.code === 'PGRST404') {
          return { tablesExist: false, error: null };
        }
        
        // For any other errors, including 500 (permission denied), we'll still 
        // proceed with empty settings to avoid breaking the UI
        return { tablesExist: true, error: null };
      }
      
      return { tablesExist: true, error: null };
    } catch (error: any) {
      // Handle network errors, etc.
      console.error('Unexpected error checking tables:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { tablesExist: false, error: null };
      }
      
      // For any other errors, including 500, we'll still proceed with empty settings
      return { tablesExist: true, error: null };
    }
  }
  
  /**
   * Get agency general settings
   */
  static async getGeneralSettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('general_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting general settings:', error);
        }
        
        // Return empty settings for any error to avoid breaking the UI
        return { settings: {}, error: null };
      }
      
      return { settings: data?.general_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting general settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      // Return empty settings for any error to avoid breaking the UI
      return { settings: {}, error: null };
    }
  }

  /**
   * Get agency billing settings
   */
  static async getBillingSettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('billing_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting billing settings:', error);
        }
        return { settings: {}, error };
      }
      
      return { settings: data?.billing_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting billing settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      return { 
        settings: {}, 
        error: { 
          message: 'Failed to fetch billing settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Get agency notification settings
   */
  static async getNotificationSettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('notification_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting notification settings:', error);
        }
        return { settings: {}, error };
      }
      
      return { settings: data?.notification_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting notification settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      return { 
        settings: {}, 
        error: { 
          message: 'Failed to fetch notification settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Get agency team settings
   */
  static async getTeamSettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('team_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting team settings:', error);
        }
        return { settings: {}, error };
      }
      
      return { settings: data?.team_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting team settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      return { 
        settings: {}, 
        error: { 
          message: 'Failed to fetch team settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Get agency security settings
   */
  static async getSecuritySettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('security_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting security settings:', error);
        }
        return { settings: {}, error };
      }
      
      return { settings: data?.security_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting security settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      return { 
        settings: {}, 
        error: { 
          message: 'Failed to fetch security settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Get agency integration settings
   */
  static async getIntegrationSettings(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { settings: {}, error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('agency_settings')
        .select('integration_settings')
        .eq('agency_id', agencyId)
        .single();
      
      if (error) {
        // Log only if it's not a "not found" error which is expected for new users
        if (error.code !== 'PGRST116') {
          console.error('Error getting integration settings:', error);
        }
        return { settings: {}, error };
      }
      
      return { settings: data?.integration_settings || {}, error: null };
    } catch (error: any) {
      console.error('Unexpected error getting integration settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { settings: {}, error: null };
      }
      
      return { 
        settings: {}, 
        error: { 
          message: 'Failed to fetch integration settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Update agency general settings
   */
  static async updateGeneralSettings(agencyId: string, settings: GeneralSettingsFormValues) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { 
          success: false, 
          error: { 
            message: 'Settings tables do not exist. Please contact an administrator.', 
            statusCode: 404 
          } 
        };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      
      // Check if settings exist
      const { data: existingSettings, error: checkError } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      // Check for RLS permission issues
      if (checkError && checkError.code === 'PGRST403') {
        return { 
          success: false, 
          error: { 
            message: 'You do not have permission to access these settings.', 
            statusCode: 403 
          } 
        };
      }
      
      // Ignore "not found" errors as we'll create the settings
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing settings:', checkError);
        
        // For 500 errors (likely RLS policy issues)
        if (checkError.code === 'PGRST500') {
          return { 
            success: false, 
            error: { 
              message: 'Unable to access settings. This may be due to permissions.', 
              statusCode: 500 
            } 
          };
        }
        
        return { success: false, error: checkError };
      }
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ general_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            general_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating general settings:', result.error);
        
        // For permission errors, show a more user-friendly message
        if (result.error.code === 'PGRST403') {
          return { 
            success: false, 
            error: { 
              message: 'You do not have permission to update these settings.', 
              statusCode: 403 
            } 
          };
        }
        
        // For 500 errors (likely RLS policy issues)
        if (result.error.code === 'PGRST500') {
          return { 
            success: false, 
            error: { 
              message: 'Unable to update settings. This may be due to permissions.', 
              statusCode: 500 
            } 
          };
        }
        
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Unexpected error updating general settings:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { 
          success: false, 
          error: { 
            message: 'Settings tables do not exist. Please contact an administrator.', 
            statusCode: 404 
          } 
        };
      }
      
      // For permission errors, show a more user-friendly message
      if (error.code === 'PGRST403') {
        return { 
          success: false, 
          error: { 
            message: 'You do not have permission to update these settings.', 
            statusCode: 403 
          } 
        };
      }
      
      // For 500 errors (likely RLS policy issues)
      if (error.code === 'PGRST500') {
        return { 
          success: false, 
          error: { 
            message: 'Unable to update settings. This may be due to permissions.', 
            statusCode: 500 
          } 
        };
      }
      
      return { 
        success: false, 
        error: { 
          message: 'Failed to update general settings', 
          statusCode: error.status || 500,
          code: error.code || 'UNKNOWN_ERROR'
        } 
      };
    }
  }

  /**
   * Update agency billing settings
   */
  static async updateBillingSettings(agencyId: string, settings: BillingSettingsFormValues) {
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
      
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ billing_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            billing_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating billing settings:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating billing settings:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update billing settings', statusCode: 500 } 
      };
    }
  }

  /**
   * Update agency notification settings
   */
  static async updateNotificationSettings(agencyId: string, settings: NotificationSettingsFormValues) {
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
      
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ notification_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            notification_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating notification settings:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating notification settings:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update notification settings', statusCode: 500 } 
      };
    }
  }

  /**
   * Update agency team settings
   */
  static async updateTeamSettings(agencyId: string, settings: TeamSettingsFormValues) {
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
      
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ team_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            team_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating team settings:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating team settings:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update team settings', statusCode: 500 } 
      };
    }
  }

  /**
   * Update agency security settings
   */
  static async updateSecuritySettings(agencyId: string, settings: SecuritySettingsFormValues) {
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
      
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ security_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            security_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating security settings:', result.error);
        return { success: false, error: result.error };
      }
      
      // Log security settings change in security_logs table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('security_logs')
          .insert({
            user_id: user.id,
            action_type: 'security_settings_update',
            description: 'Security settings were updated',
          });
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating security settings:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update security settings', statusCode: 500 } 
      };
    }
  }

  /**
   * Update agency integration settings
   */
  static async updateIntegrationSettings(agencyId: string, settings: IntegrationSettingsFormValues) {
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
      
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('agency_settings')
        .select('id')
        .eq('agency_id', agencyId)
        .single();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('agency_settings')
          .update({ integration_settings: settings })
          .eq('agency_id', agencyId);
      } else {
        // Insert new settings
        result = await supabase
          .from('agency_settings')
          .insert({
            agency_id: agencyId,
            integration_settings: settings,
            created_at: new Date().toISOString(),
          });
      }
      
      if (result.error) {
        console.error('Error updating integration settings:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating integration settings:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update integration settings', statusCode: 500 } 
      };
    }
  }

  /**
   * Get team members
   */
  static async getTeamMembers(agencyId: string) {
    try {
      // First check if the tables exist
      const { tablesExist } = await this.checkTablesExist();
      if (!tablesExist) {
        return { members: [], error: null };
      }
      
      const supabase = createClientComponentClient({
        options: {
          global: {
            headers: {
              'Accept': '*/*',
            },
          },
        },
      });
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('agency_id', agencyId);
      
      if (error) {
        console.error('Error getting team members:', error);
        // Return empty array for any error to avoid breaking the UI
        return { members: [], error: null };
      }
      
      return { members: data || [], error: null };
    } catch (error: any) {
      console.error('Unexpected error getting team members:', error);
      
      // Special handling for 404 (table doesn't exist) responses
      if (error.code === '404' || error.code === 'PGRST404') {
        return { members: [], error: null };
      }
      
      // Return empty array for any error to avoid breaking the UI
      return { members: [], error: null };
    }
  }

  /**
   * Invite team member
   */
  static async inviteTeamMember(agencyId: string, memberData: TeamMemberFormValues) {
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
      
      // First check if the user already exists
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('agency_id', agencyId)
        .eq('email', memberData.email)
        .single();
      
      if (existingMember) {
        return { 
          success: false, 
          error: { message: 'A team member with this email already exists', statusCode: 400 } 
        };
      }
      
      // Add the new team member
      const result = await supabase
        .from('team_members')
        .insert({
          agency_id: agencyId,
          email: memberData.email,
          name: memberData.name,
          role: memberData.role,
          can_manage_clients: memberData.can_manage_clients,
          can_manage_invoices: memberData.can_manage_invoices,
          can_manage_team: memberData.can_manage_team,
          can_access_reports: memberData.can_access_reports,
          status: 'invited',
          created_at: new Date().toISOString(),
        });
      
      if (result.error) {
        console.error('Error inviting team member:', result.error);
        return { success: false, error: result.error };
      }
      
      // In a real application, we would send an invitation email here
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error inviting team member:', error);
      return { 
        success: false, 
        error: { message: 'Failed to invite team member', statusCode: 500 } 
      };
    }
  }

  /**
   * Update team member
   */
  static async updateTeamMember(agencyId: string, memberId: string, memberData: TeamMemberFormValues) {
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
      
      const result = await supabase
        .from('team_members')
        .update({
          name: memberData.name,
          role: memberData.role,
          can_manage_clients: memberData.can_manage_clients,
          can_manage_invoices: memberData.can_manage_invoices,
          can_manage_team: memberData.can_manage_team,
          can_access_reports: memberData.can_access_reports,
        })
        .eq('id', memberId)
        .eq('agency_id', agencyId);
      
      if (result.error) {
        console.error('Error updating team member:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating team member:', error);
      return { 
        success: false, 
        error: { message: 'Failed to update team member', statusCode: 500 } 
      };
    }
  }

  /**
   * Remove team member
   */
  static async removeTeamMember(agencyId: string, memberId: string) {
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
      
      const result = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('agency_id', agencyId);
      
      if (result.error) {
        console.error('Error removing team member:', result.error);
        return { success: false, error: result.error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error removing team member:', error);
      return { 
        success: false, 
        error: { message: 'Failed to remove team member', statusCode: 500 } 
      };
    }
  }
} 
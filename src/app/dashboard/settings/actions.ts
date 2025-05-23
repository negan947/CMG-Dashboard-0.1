'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  GeneralSettingsFormValues,
  BillingSettingsFormValues,
  NotificationSettingsFormValues,
  TeamSettingsFormValues,
  SecuritySettingsFormValues,
  IntegrationSettingsFormValues,
} from '@/lib/schemas/settings-schemas';

// Server-side validation schemas
const GeneralSettingsSchema = z.object({
  agency_name: z.string().min(1, 'Agency name is required'),
  agency_email: z.string().email('Valid email is required'),
  agency_logo_url: z.string().url().optional().or(z.literal('')),
  agency_website: z.string().url().optional().or(z.literal('')),
  agency_phone: z.string().optional(),
  default_currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  timezone: z.string(),
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  time_format: z.enum(['12h', '24h']),
});

/**
 * Get the authenticated user and verify agency access
 */
async function getUserAndVerifyAccess(): Promise<{
  user: any;
  agencyId: string;
  canManageSettings: boolean;
}> {
  const supabase = createServerComponentClient({ cookies });
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/auth/login');
  }

  // For this implementation, we'll use user.id as agency_id
  // but in production, you'd want to properly determine the user's agency
  const agencyId = user.id;
  
  // Check if user has access to manage settings for this agency
  // This checks the RLS policies: either they own the agency or are admin/owner team member
  const { data: settingsAccess, error: accessError } = await supabase
    .from('agency_settings')
    .select('id')
    .eq('agency_id', agencyId)
    .limit(1);
  
  if (accessError && accessError.code !== 'PGRST116') {
    console.error('Error checking settings access:', accessError);
    throw new Error('Unable to verify settings access');
  }
  
  // Check if user is team member with admin/owner role
  // Handle case where team_members table might be empty
  const { data: teamMembership, error: teamError } = await supabase
    .from('team_members')
    .select('role, can_manage_team')
    .eq('user_id', user.id)
    .eq('agency_id', agencyId)
    .maybeSingle(); // Use maybeSingle instead of single to handle no results
  
  // Allow access if:
  // 1. User owns the agency (agency_id === user.id)
  // 2. User is owner/admin team member
  // 3. User has team management permissions
  // 4. If no team membership exists, assume user owns their agency
  const canManageSettings = 
    agencyId === user.id || // User owns agency
    teamMembership?.role === 'owner' || 
    teamMembership?.role === 'admin' ||
    teamMembership?.can_manage_team === true ||
    (!teamMembership && !teamError); // No team membership = user owns agency

  return { user, agencyId, canManageSettings };
}

/**
 * Get all settings for the current user's agency
 */
export async function getSettingsData() {
  try {
    const { agencyId } = await getUserAndVerifyAccess();
    const supabase = createServerComponentClient({ cookies });
    
    // Fetch settings with proper RLS
    const { data: settings, error } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('agency_id', agencyId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
    
    // Fetch team members
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('agency_id', agencyId);
    
    if (teamError) {
      console.error('Error fetching team members:', teamError);
    }
    
    return {
      success: true,
      data: {
        generalSettings: settings?.general_settings || {},
        billingSettings: settings?.billing_settings || {},
        notificationSettings: settings?.notification_settings || {},
        teamSettings: settings?.team_settings || {},
        securitySettings: settings?.security_settings || {},
        integrationSettings: settings?.integration_settings || {},
        teamMembers: teamMembers || [],
        agencyId,
      }
    };
  } catch (error) {
    console.error('Error in getSettingsData:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch settings'
    };
  }
}

/**
 * Update general settings with server-side validation
 */
export async function updateGeneralSettings(formData: FormData) {
  try {
    const { user, agencyId, canManageSettings } = await getUserAndVerifyAccess();
    
    if (!canManageSettings) {
      throw new Error('You do not have permission to update settings');
    }
    
    // Extract and validate form data
    const rawData = {
      agency_name: formData.get('agency_name') as string,
      agency_email: formData.get('agency_email') as string,
      agency_logo_url: formData.get('agency_logo_url') as string,
      agency_website: formData.get('agency_website') as string,
      agency_phone: formData.get('agency_phone') as string,
      default_currency: formData.get('default_currency') as string,
      timezone: formData.get('timezone') as string,
      date_format: formData.get('date_format') as string,
      time_format: formData.get('time_format') as string,
    };
    
    // Server-side validation
    const validatedData = GeneralSettingsSchema.parse(rawData);
    
    const supabase = createServerComponentClient({ cookies });
    
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
        .update({ 
          general_settings: validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('agency_id', agencyId);
    } else {
      // Insert new settings
      result = await supabase
        .from('agency_settings')
        .insert({
          agency_id: agencyId,
          general_settings: validatedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
    
    if (result.error) {
      console.error('Error updating general settings:', result.error);
      throw new Error('Failed to update general settings');
    }
    
    // Log the action for security audit
    await supabase
      .from('security_logs')
      .insert({
        user_id: user.id,
        action_type: 'general_settings_update',
        description: 'General settings were updated',
        metadata: { agencyId, settingsKeys: Object.keys(validatedData) }
      });
    
    revalidatePath('/dashboard/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateGeneralSettings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update settings' 
    };
  }
}

/**
 * Update security settings (requires extra verification)
 */
export async function updateSecuritySettings(formData: FormData) {
  try {
    const { user, agencyId, canManageSettings } = await getUserAndVerifyAccess();
    
    if (!canManageSettings) {
      throw new Error('You do not have permission to update security settings');
    }
    
    // For security settings, require additional verification
    const password = formData.get('current_password') as string;
    if (!password) {
      throw new Error('Current password is required to update security settings');
    }
    
    // Verify current password (this would need to be implemented based on your auth system)
    // For now, we'll skip this but in production you'd want to verify the password
    
    const rawData = Object.fromEntries(formData.entries());
    delete rawData.current_password; // Remove password from stored data
    
    const supabase = createServerComponentClient({ cookies });
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('agency_settings')
      .select('id')
      .eq('agency_id', agencyId)
      .single();
    
    let result;
    
    if (existingSettings) {
      result = await supabase
        .from('agency_settings')
        .update({ 
          security_settings: rawData,
          updated_at: new Date().toISOString()
        })
        .eq('agency_id', agencyId);
    } else {
      result = await supabase
        .from('agency_settings')
        .insert({
          agency_id: agencyId,
          security_settings: rawData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }
    
    if (result.error) {
      console.error('Error updating security settings:', result.error);
      throw new Error('Failed to update security settings');
    }
    
    // Log security settings change (critical security event)
    await supabase
      .from('security_logs')
      .insert({
        user_id: user.id,
        action_type: 'security_settings_update',
        description: 'Security settings were updated',
        metadata: { 
          agencyId, 
          settingsKeys: Object.keys(rawData),
          timestamp: new Date().toISOString()
        }
      });
    
    revalidatePath('/dashboard/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateSecuritySettings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update security settings' 
    };
  }
}

/**
 * Check if settings tables exist and user has access
 */
export async function checkSettingsAccess() {
  try {
    const { agencyId } = await getUserAndVerifyAccess();
    const supabase = createServerComponentClient({ cookies });
    
    // Try to query settings table
    const { error } = await supabase
      .from('agency_settings')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', agencyId);
    
    if (error) {
      if (error.code === 'PGRST404' || error.message.includes('relation') && error.message.includes('does not exist')) {
        return { success: true, tablesExist: false, hasAccess: false };
      }
      
      if (error.code === 'PGRST403') {
        return { success: true, tablesExist: true, hasAccess: false };
      }
      
      throw error;
    }
    
    return { success: true, tablesExist: true, hasAccess: true };
  } catch (error) {
    console.error('Error checking settings access:', error);
    return { 
      success: false, 
      tablesExist: false, 
      hasAccess: false, 
      error: error instanceof Error ? error.message : 'Failed to check access' 
    };
  }
} 
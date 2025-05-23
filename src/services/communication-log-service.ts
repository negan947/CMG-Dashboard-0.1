import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CommunicationLogModel, CreateCommunicationLogInput, UpdateCommunicationLogInput } from '@/types/models.types';
import { handleSupabaseError } from '@/lib/error-handling';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Service for managing communication logs using DIRECT Supabase client methods
 */
export class CommunicationLogService {
  /**
   * Get communication logs for a specific client
   */
  static async getLogsByClientId(clientId: number): Promise<CommunicationLogModel[]> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('communication_timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data.map(this.mapDbLogToModel);
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Get the most recent communication log for a client
   */
  static async getLastCommunicationForClient(clientId: number): Promise<CommunicationLogModel | null> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('communication_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      return data ? this.mapDbLogToModel(data) : null;
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Get communication logs for a specific agency
   */
  static async getLogsByAgencyId(agencyId: number): Promise<CommunicationLogModel[]> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('communication_logs')
        .select('*')
        .eq('agency_id', agencyId)
        .order('communication_timestamp', { ascending: false });
      
      if (error) throw error;
      
      return data.map(this.mapDbLogToModel);
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Create a new communication log
   */
  static async createLog(input: CreateCommunicationLogInput): Promise<CommunicationLogModel> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          client_id: input.clientId,
          agency_id: input.agencyId,
          communication_type: input.communicationType,
          summary: input.summary,
          created_by_user_id: input.createdByUserId,
          communication_timestamp: input.communicationTimestamp || new Date().toISOString(),
          metadata: input.metadata
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      return this.mapDbLogToModel(data);
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Update an existing communication log
   */
  static async updateLog(input: UpdateCommunicationLogInput): Promise<CommunicationLogModel> {
    try {
      const supabase = createClientComponentClient();
      
      const updateData: any = {};
      if (input.communicationType) updateData.communication_type = input.communicationType;
      if (input.summary) updateData.summary = input.summary;
      if (input.metadata) updateData.metadata = input.metadata;
      if (input.communicationTimestamp) updateData.communication_timestamp = input.communicationTimestamp;
      
      const { data, error } = await supabase
        .from('communication_logs')
        .update(updateData)
        .eq('id', input.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return this.mapDbLogToModel(data);
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Delete a communication log
   */
  static async deleteLog(id: string): Promise<void> {
    try {
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('communication_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  }

  /**
   * Map database log to model
   */
  private static mapDbLogToModel(dbLog: any): CommunicationLogModel {
    return {
      id: dbLog.id,
      clientId: dbLog.client_id,
      agencyId: dbLog.agency_id,
      communicationType: dbLog.communication_type,
      summary: dbLog.summary,
      createdByUserId: dbLog.created_by_user_id,
      communicationTimestamp: dbLog.communication_timestamp,
      metadata: dbLog.metadata,
      createdAt: dbLog.created_at,
      updatedAt: dbLog.updated_at
    };
  }
} 
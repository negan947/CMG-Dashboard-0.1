import { ClientModel } from '@/types/models.types';
import { mapDbRow } from '@/lib/data-mapper';
import { createClient } from '@/lib/supabase-server';

/**
 * Server-side service for managing client data using server Supabase client
 */
export const ClientServiceServer = {
  /**
   * Get all clients (optionally filtered by agency ID)
   */
  async getClients(agencyId?: number): Promise<ClientModel[]> {
    const supabase = await createClient();
    try {
      let query = supabase.from('clients').select('*');
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      query = query.order('name');

      const { data, error } = await query;

      if (error) {
        console.error('Supabase getClients error:', error);
        throw new Error(error.message || 'Failed to fetch clients');
      }
      
      return (data || []).map(row => mapDbRow(row) as ClientModel);
    } catch (error) {
      console.error('Error in getClients (server method):', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching clients');
    }
  },

  /**
   * Get a client by ID
   */
  async getClientById(id: number): Promise<ClientModel | null> {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle to handle not found gracefully

      if (error) {
        console.error(`Supabase getClientById error (ID: ${id}):`, error);
        throw new Error(error.message || 'Failed to fetch client by ID');
      }

      return data ? mapDbRow(data) as ClientModel : null;
    } catch (error) {
      console.error(`Error in getClientById (ID: ${id}, server method):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching client by ID');
    }
  },

  /**
   * Get clients by agency ID
   */
  async getClientsByAgencyId(agencyId: number): Promise<ClientModel[]> {
    // This method is essentially the same as getClients with a required agencyId
    return this.getClients(agencyId);
  }
}; 
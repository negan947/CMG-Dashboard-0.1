import { ClientModel, CreateClientInput, UpdateClientInput } from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';
import { createClient } from '@/lib/supabase';
import { sanitizeSearchQuery } from '@/lib/utils';

/**
 * Service for managing client data using DIRECT Supabase client methods
 */
export const ClientService = {
  /**
   * Get all clients (optionally filtered by agency ID)
   */
  async getClients(agencyId?: number): Promise<ClientModel[]> {
    const supabase = createClient();
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
      console.error('Error in getClients (direct method):', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching clients');
    }
  },

  /**
   * Get a client by ID
   */
  async getClientById(id: number): Promise<ClientModel | null> {
    const supabase = createClient();
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
      console.error(`Error in getClientById (ID: ${id}, direct method):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching client by ID');
    }
  },

  /**
   * Get clients by agency ID
   */
  async getClientsByAgencyId(agencyId: number): Promise<ClientModel[]> {
    // This method is essentially the same as getClients with a required agencyId
    // We can reuse getClients for consistency or keep it separate if specific logic is needed later
    return this.getClients(agencyId);
  },

  /**
   * Create a new client using DIRECT SUPABASE CLIENT
   */
  async createClient(client: CreateClientInput & { slug: string }): Promise<ClientModel> {
    const supabase = createClient();
    const clientDataSnake = camelToSnakeObject(client);

    const dataToInsert = {
      name: clientDataSnake.name,
      slug: clientDataSnake.slug,
      agency_id: clientDataSnake.agency_id,
      email: clientDataSnake.email,
      phone: clientDataSnake.phone,
      address: clientDataSnake.address,
      city: clientDataSnake.city,
      state: clientDataSnake.state,
      zip_code: clientDataSnake.zip_code,
      country: clientDataSnake.country,
      status: clientDataSnake.status,
      notes: clientDataSnake.notes,
      avatar_url: clientDataSnake.avatar_url, 
      website: clientDataSnake.website,
      industry: clientDataSnake.industry,
      company_size: clientDataSnake.company_size,
      contact_name: clientDataSnake.contact_name,
      contact_position: clientDataSnake.contact_position,
    };

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Supabase direct insert error:', error);
        throw new Error(error.message || 'Failed to create client in database');
      }

      if (!data) {
        throw new Error('No data returned after client creation');
      }

      return mapDbRow(data) as ClientModel;
    } catch (error) {
      console.error('Error in createClient (direct method):', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred during client creation');
    }
  },

  /**
   * Update an existing client using DIRECT SUPABASE CLIENT
   */
  async updateClient(client: UpdateClientInput): Promise<ClientModel> {
    const supabase = createClient();
    const { id, ...updateData } = client;
    
    if (!id) {
      throw new Error('Client ID is required for update');
    }

    // Convert only the fields being updated to snake_case
    const updateDataSnake = camelToSnakeObject(updateData);
    
    // Generate slug if name is being updated
    if (updateDataSnake.name) {
      updateDataSnake.slug = updateDataSnake.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updateDataSnake)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Supabase updateClient error (ID: ${id}):`, error);
        throw new Error(error.message || 'Failed to update client');
      }
      
       if (!data) {
        throw new Error('No data returned after client update');
      }

      return mapDbRow(data) as ClientModel;
    } catch (error) {
      console.error(`Error in updateClient (ID: ${id}, direct method):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred updating client');
    }
  },

  /**
   * Delete a client using DIRECT SUPABASE CLIENT
   */
  async deleteClient(id: number): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Supabase deleteClient error (ID: ${id}):`, error);
        throw new Error(error.message || 'Failed to delete client');
      }
      // No return value needed for delete
    } catch (error) {
      console.error(`Error in deleteClient (ID: ${id}, direct method):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred deleting client');
    }
  },

  /**
   * Search clients by name, email, or contact name
   */
  async searchClients(query: string): Promise<ClientModel[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Sanitize the query to prevent SQL injection
    const safeQuery = sanitizeSearchQuery(query);
    if (!safeQuery) {
      return [];
    }
    
    const supabase = createClient();
    try {
      // Use the documented string format for .or()
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,contact_name.ilike.%${safeQuery}%`)
        .order('name')
        .limit(10);
      
      if (error) {
        console.error('Error searching clients:', error);
        return [];
      }
      
      return (data || []).map(row => mapDbRow(row) as ClientModel);
    } catch (err) {
      console.error('Unexpected error searching clients:', err);
      return [];
    }
  },

  /**
   * Get singleton instance (to match the expected interface in search-store)
   */
  getInstance(): typeof ClientService {
    return this;
  }
}; 
import { MCP } from '@/lib/mcp';
import { ClientModel, CreateClientInput, UpdateClientInput } from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';

/**
 * Service for managing client data
 */
export const ClientService = {
  /**
   * Get all clients
   * @param agencyId Optional filter by agency ID
   * @returns Array of clients
   */
  async getClients(agencyId?: number): Promise<ClientModel[]> {
    let query = 'SELECT * FROM clients';
    const params: any[] = [];

    if (agencyId) {
      query += ' WHERE agency_id = $1';
      params.push(agencyId);
    }

    query += ' ORDER BY name';

    try {
      const result = await MCP.supabase.query(query, params);
      return result.rows.map(row => mapDbRow(row) as ClientModel);
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  /**
   * Get a client by ID
   * @param id Client ID
   * @returns Client or null if not found
   */
  async getClientById(id: number): Promise<ClientModel | null> {
    try {
      const result = await MCP.supabase.query(
        'SELECT * FROM clients WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapDbRow(result.rows[0]) as ClientModel;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get clients by agency ID
   * @param agencyId Agency ID
   * @returns Array of clients
   */
  async getClientsByAgencyId(agencyId: number): Promise<ClientModel[]> {
    try {
      const result = await MCP.supabase.query(
        'SELECT * FROM clients WHERE agency_id = $1 ORDER BY name',
        [agencyId]
      );

      return result.rows.map(row => mapDbRow(row) as ClientModel);
    } catch (error) {
      console.error(`Error fetching clients for agency ${agencyId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new client
   * @param client Client data
   * @returns Created client
   */
  async createClient(client: CreateClientInput): Promise<ClientModel> {
    const clientData = camelToSnakeObject(client);
    
    try {
      const result = await MCP.supabase.query(
        `INSERT INTO clients (name, slug, agency_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [clientData.name, clientData.slug, clientData.agency_id]
      );

      return mapDbRow(result.rows[0]) as ClientModel;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  /**
   * Update an existing client
   * @param client Client data with ID
   * @returns Updated client
   */
  async updateClient(client: UpdateClientInput): Promise<ClientModel> {
    if (!client.id) {
      throw new Error('Client ID is required for update');
    }

    const clientData = camelToSnakeObject(client);
    
    try {
      const result = await MCP.supabase.query(
        `UPDATE clients 
         SET name = $1, slug = $2, agency_id = $3 
         WHERE id = $4 
         RETURNING *`,
        [clientData.name, clientData.slug, clientData.agency_id, clientData.id]
      );

      return mapDbRow(result.rows[0]) as ClientModel;
    } catch (error) {
      console.error(`Error updating client with ID ${client.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a client
   * @param id Client ID
   */
  async deleteClient(id: number): Promise<void> {
    try {
      await MCP.supabase.query(
        'DELETE FROM clients WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  }
}; 
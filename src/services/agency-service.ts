import { MCP } from '@/lib/mcp';
import { AgencyModel, CreateAgencyInput, UpdateAgencyInput } from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';

/**
 * Service for managing agency data
 */
export const AgencyService = {
  /**
   * Get all agencies
   * @returns Array of agencies
   */
  async getAgencies(): Promise<AgencyModel[]> {
    try {
      const result = await MCP.supabase.query('SELECT * FROM agencies ORDER BY name');
      return result.rows.map(row => mapDbRow(row) as AgencyModel);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  },

  /**
   * Get an agency by ID
   * @param id Agency ID
   * @returns Agency or null if not found
   */
  async getAgencyById(id: number): Promise<AgencyModel | null> {
    try {
      const result = await MCP.supabase.query(
        'SELECT * FROM agencies WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapDbRow(result.rows[0]) as AgencyModel;
    } catch (error) {
      console.error(`Error fetching agency with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new agency
   * @param agency Agency data
   * @returns Created agency
   */
  async createAgency(agency: CreateAgencyInput): Promise<AgencyModel> {
    const agencyData = camelToSnakeObject(agency);
    
    try {
      const result = await MCP.supabase.query(
        `INSERT INTO agencies (name, slug) 
         VALUES ($1, $2) 
         RETURNING *`,
        [agencyData.name, agencyData.slug]
      );

      return mapDbRow(result.rows[0]) as AgencyModel;
    } catch (error) {
      console.error('Error creating agency:', error);
      throw error;
    }
  },

  /**
   * Update an existing agency
   * @param agency Agency data with ID
   * @returns Updated agency
   */
  async updateAgency(agency: UpdateAgencyInput): Promise<AgencyModel> {
    if (!agency.id) {
      throw new Error('Agency ID is required for update');
    }

    const agencyData = camelToSnakeObject(agency);
    
    try {
      const result = await MCP.supabase.query(
        `UPDATE agencies 
         SET name = $1, slug = $2 
         WHERE id = $3 
         RETURNING *`,
        [agencyData.name, agencyData.slug, agencyData.id]
      );

      return mapDbRow(result.rows[0]) as AgencyModel;
    } catch (error) {
      console.error(`Error updating agency with ID ${agency.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an agency
   * @param id Agency ID
   */
  async deleteAgency(id: number): Promise<void> {
    try {
      await MCP.supabase.query(
        'DELETE FROM agencies WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error(`Error deleting agency with ID ${id}:`, error);
      throw error;
    }
  }
}; 
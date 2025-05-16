import { ProjectModel } from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper'; // Assuming mapDbRow can handle project structure
import { createClient } from '@/lib/supabase';

/**
 * Service for managing project data using DIRECT Supabase client methods
 */
export const ProjectService = {
  /**
   * Get all projects for a specific client ID
   */
  async getProjectsByClientId(clientId: number | string): Promise<ProjectModel[]> {
    const supabase = createClient();
    // Ensure clientId is a number for the DB query if it comes in as a string
    const numericClientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;

    if (isNaN(numericClientId)) {
      console.error('Invalid clientId provided to getProjectsByClientId:', clientId);
      return []; // Or throw an error
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', numericClientId)
        .order('name'); // Default order by name

      if (error) {
        console.error(`Supabase getProjectsByClientId error (clientId: ${numericClientId}):`, error);
        // Consider using a more robust error handling mechanism from error-handling.ts
        throw new Error(error.message || 'Failed to fetch projects for client');
      }
      
      // Assuming mapDbRow correctly maps snake_case from DB to camelCase ProjectModel fields
      // and converts id, client_id to string if necessary.
      return (data || []).map(row => mapDbRow(row) as ProjectModel);
    } catch (error) {
      console.error(`Error in getProjectsByClientId (clientId: ${numericClientId}):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching projects');
    }
  },

  // Placeholder for createProject, updateProject, deleteProject if needed later
  // async createProject(project: CreateProjectInput): Promise<ProjectModel> { ... }
  // async updateProject(project: UpdateProjectInput): Promise<ProjectModel> { ... }
  // async deleteProject(id: number): Promise<void> { ... }
}; 
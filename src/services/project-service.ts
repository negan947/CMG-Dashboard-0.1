import { MCP } from '@/lib/mcp';
import { ProjectModel, CreateProjectInput, UpdateProjectInput } from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';
import { createClient } from '@/lib/supabase'; // Import the Supabase client helper
import { handleSupabaseError } from '@/lib/error-handling'; // Import handleSupabaseError
import { sanitizeSearchQuery } from '@/lib/utils';

/**
 * Service for managing project data
 */
export const ProjectService = {
  /**
   * Get all projects
   * @param clientId Optional filter by client ID
   * @returns Array of projects
   */
  async getProjects(clientId?: number): Promise<ProjectModel[]> {
    let query = 'SELECT * FROM projects';
    const params: any[] = [];

    if (clientId) {
      query += ' WHERE client_id = $1';
      params.push(clientId);
    }

    query += ' ORDER BY name';

    try {
      const result = await MCP.supabase.query(query, params);
      return result.rows.map(row => mapDbRow(row) as ProjectModel);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Project or null if not found
   */
  async getProjectById(id: number): Promise<ProjectModel | null> {
    try {
      const result = await MCP.supabase.query(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return mapDbRow(result.rows[0]) as ProjectModel;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get projects by client ID
   * @param clientId Client ID
   * @returns Array of projects
   */
  async getProjectsByClientId(clientId: number): Promise<ProjectModel[]> {
    try {
      const result = await MCP.supabase.query(
        'SELECT * FROM projects WHERE client_id = $1 ORDER BY name',
        [clientId]
      );

      return result.rows.map(row => mapDbRow(row) as ProjectModel);
    } catch (error) {
      console.error(`Error fetching projects for client ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Get projects by agency ID using the direct Supabase client
   * @param agencyId Agency ID
   * @returns Array of projects
   */
  async getProjectsByAgencyId(agencyId: number): Promise<ProjectModel[]> {
    const supabase = createClient(); // Use the direct client
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('agency_id', agencyId)
        .order('name');

      if (error) throw error;

      // Map snake_case database columns to camelCase model properties
      return (data || []).map(row => mapDbRow(row) as ProjectModel);
    } catch (error) {
      console.error(`Error fetching projects for agency ${agencyId}:`, error);
      // Use handleSupabaseError for consistent error handling, casting error
      throw handleSupabaseError(error as any); // Keeping 'any' for now, will refine if needed
    }
  },

  /**
   * Create a new project
   * @param project Project data
   * @returns Created project
   */
  async createProject(project: CreateProjectInput): Promise<ProjectModel> {
    const projectData = camelToSnakeObject(project);
    
    try {
      const result = await MCP.supabase.query(
        `INSERT INTO projects (name, slug, description, client_id, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          projectData.name, 
          projectData.slug, 
          projectData.description, 
          projectData.client_id,
          projectData.status || 'active'
        ]
      );

      return mapDbRow(result.rows[0]) as ProjectModel;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param project Project data with ID
   * @returns Updated project
   */
  async updateProject(project: UpdateProjectInput): Promise<ProjectModel> {
    if (!project.id) {
      throw new Error('Project ID is required for update');
    }

    const projectData = camelToSnakeObject(project);
    
    try {
      const result = await MCP.supabase.query(
        `UPDATE projects 
         SET name = $1, slug = $2, description = $3, client_id = $4, status = $5 
         WHERE id = $6 
         RETURNING *`,
        [
          projectData.name, 
          projectData.slug, 
          projectData.description, 
          projectData.client_id,
          projectData.status || 'active',
          projectData.id
        ]
      );

      return mapDbRow(result.rows[0]) as ProjectModel;
    } catch (error) {
      console.error(`Error updating project with ID ${project.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a project
   * @param id Project ID
   */
  async deleteProject(id: number): Promise<void> {
    try {
      await MCP.supabase.query(
        'DELETE FROM projects WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error(`Error deleting project with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search projects by name, description, or status
   * Also includes client name in results for better context
   */
  async searchProjects(query: string): Promise<Array<ProjectModel & { client_name?: string }>> {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Sanitize the query to prevent SQL injection
    const safeQuery = sanitizeSearchQuery(query);
    if (!safeQuery) {
      return [];
    }
    
    const searchPattern = `%${safeQuery}%`;
    const supabase = createClient();
    
    try {
      // Use direct Supabase client with proper parameterized queries
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients(name)
        `)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},status.ilike.${searchPattern}`)
        .order('name')
        .limit(10);
      
      if (error) {
        console.error('Error searching projects:', error);
        return [];
      }
      
      // Process results and include client name
      return data.map(row => {
        const project = mapDbRow(row) as ProjectModel & { client_name?: string };
        // Add client_name from the joined table
        if (row.clients) {
          project.client_name = (row.clients as any).name;
        }
        return project;
      });
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  },

  /**
   * Get singleton instance (to match the expected interface in search-store)
   */
  getInstance(): typeof ProjectService {
    return this;
  }
}; 
import { 
  TaskModel, 
  CreateTaskInput, 
  UpdateTaskInput 
} from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { handleSupabaseError } from '@/lib/error-handling';

/**
 * Service for managing tasks using DIRECT Supabase client methods
 */
export const TaskService = {
  /**
   * Get tasks for a specific project
   */
  async getTasksByProjectId(projectId: number): Promise<TaskModel[]> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map(this.mapDbTaskToModel);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get tasks for all projects related to a specific client
   */
  async getTasksByClientId(clientId: number): Promise<TaskModel[]> {
    try {
      const supabase = createClientComponentClient();
      
      // First get the client's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', clientId);
      
      if (projectsError) throw projectsError;
      
      if (!projects.length) return [];
      
      // Then get tasks for these projects
      const projectIds = projects.map(p => p.id);
      
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds)
        .order('status', { ascending: true }) // todo first, completed last
        .order('priority', { ascending: true }) // high priority first
        .order('due_date', { ascending: true });
      
      if (tasksError) throw tasksError;
      
      return tasks.map(this.mapDbTaskToModel);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get upcoming tasks (follow-ups) for a specific client that are due soon
   */
  async getUpcomingTasksByClientId(clientId: number, limit: number = 3): Promise<TaskModel[]> {
    const supabase = createClientComponentClient();
    try {
      // Get tasks with due_date in the future, ordered by due_date asc
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects!inner(*)')
        .eq('projects.client_id', clientId)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error(`Supabase getUpcomingTasksByClientId error (clientId: ${clientId}):`, error);
        throw new Error(error.message || 'Failed to fetch upcoming client tasks');
      }
      
      // Process the joined results to return just the task data
      return (data || []).map(row => {
        const { projects, ...taskData } = row;
        return this.mapDbTaskToModel(taskData);
      });
    } catch (error) {
      console.error(`Error in getUpcomingTasksByClientId (clientId: ${clientId}):`, error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred fetching upcoming client tasks');
    }
  },

  /**
   * Get tasks for a specific agency
   */
  async getTasksByAgencyId(agencyId: number): Promise<TaskModel[]> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('agency_id', agencyId)
        .order('status', { ascending: true }) // todo first, completed last
        .order('priority', { ascending: true }) // high priority first
        .order('due_date', { ascending: true })
        .limit(20); // Limit to avoid overloading
      
      if (error) throw error;
      
      return data.map(this.mapDbTaskToModel);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<TaskModel> {
    try {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description,
          project_id: input.projectId,
          assignee_id: input.assigneeId,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          due_date: input.dueDate,
          agency_id: input.agencyId,
          created_by_user_id: input.createdByUserId
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      return this.mapDbTaskToModel(data);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Update an existing task
   */
  async updateTask(input: UpdateTaskInput): Promise<TaskModel> {
    try {
      const supabase = createClientComponentClient();
      
      const updateData: any = {};
      if (input.title) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.projectId) updateData.project_id = input.projectId;
      if (input.assigneeId !== undefined) updateData.assignee_id = input.assigneeId;
      if (input.status) updateData.status = input.status;
      if (input.priority) updateData.priority = input.priority;
      if (input.dueDate) updateData.due_date = input.dueDate;
      if (input.agencyId) updateData.agency_id = input.agencyId;
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', input.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return this.mapDbTaskToModel(data);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Mark a task as completed
   */
  async completeTask(taskId: number): Promise<TaskModel> {
    return this.updateTask({
      id: taskId,
      status: 'completed'
    });
  },

  /**
   * Map database task to model
   */
  mapDbTaskToModel(dbTask: any): TaskModel {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      projectId: dbTask.project_id,
      assigneeId: dbTask.assignee_id,
      status: dbTask.status,
      priority: dbTask.priority,
      dueDate: dbTask.due_date,
      agencyId: dbTask.agency_id,
      createdByUserId: dbTask.created_by_user_id,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at
    };
  }
}; 
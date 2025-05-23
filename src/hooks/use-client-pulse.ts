import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TaskModel, CommunicationLogModel, CreateTaskInput, CreateCommunicationLogInput } from '@/types/models.types';
import { TaskService } from '@/services/task-service';
import { CommunicationLogService } from '@/services/communication-log-service';
import { toast } from 'sonner';
import { addDays, isPast, isToday } from 'date-fns';

export type TaskFilter = 'all' | 'upcoming' | 'overdue' | 'completed' | 'high';

export interface ClientPulseData {
  tasks: TaskModel[];
  communicationLogs: CommunicationLogModel[];
  isLoading: boolean;
  projects: { id: number; name: string }[];
  userId: string | null;
  activeAgencyId: number | null;
  clientId?: number;
  clientName?: string;
  activeFilter: TaskFilter;
  searchQuery: string;
  error: string | null;
}

export function useClientPulse(clientId?: number, agencyId?: number): ClientPulseData & {
  filteredTasks: TaskModel[];
  setActiveFilter: (filter: TaskFilter) => void;
  setSearchQuery: (query: string) => void;
  handleComplete: (taskId: number) => Promise<void>;
  handleSnooze: (taskId: number, days: number) => Promise<void>;
  createTask: (input: Omit<CreateTaskInput, 'agencyId' | 'createdByUserId' | 'projectId'>) => Promise<boolean>;
  logCommunication: (input: Omit<CreateCommunicationLogInput, 'agencyId' | 'createdByUserId' | 'clientId'>) => Promise<boolean>;
  fetchTasks: () => Promise<void>;
  fetchCommunicationLogs: () => Promise<void>;
} {
  const [data, setData] = useState<ClientPulseData>({
    tasks: [],
    communicationLogs: [],
    isLoading: true,
    projects: [],
    userId: null,
    activeAgencyId: null,
    clientId,
    activeFilter: 'all',
    searchQuery: '',
    error: null,
  });
  
  // Set up state updaters
  const updateData = (updates: Partial<ClientPulseData>) => {
    setData(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  const setActiveFilter = (filter: TaskFilter) => {
    updateData({ activeFilter: filter });
  };
  
  const setSearchQuery = (query: string) => {
    updateData({ searchQuery: query });
  };
  
  // Get user info
  useEffect(() => {
    const getUserInfo = async () => {
      const supabase = createClientComponentClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) updateData({ userId: user.id });
      
      // Get user's profile to find their agency_id if not provided
      if (!agencyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id || '')
          .single();
          
        if (profile?.agency_id) updateData({ activeAgencyId: profile.agency_id });
      } else {
        updateData({ activeAgencyId: agencyId });
      }
      
      // If we have a clientId, fetch the client name
      if (clientId) {
        const { data: client } = await supabase
          .from('clients')
          .select('name')
          .eq('id', clientId)
          .single();
          
        if (client?.name) {
          updateData({ clientName: client.name });
        }
      }
    };
    
    getUserInfo();
  }, [agencyId, clientId]);
  
  // Get projects for client or agency
  useEffect(() => {
    const getProjects = async () => {
      if (!data.activeAgencyId) {
        console.log('Cannot fetch projects: No active agency ID');
        return;
      }
      
      const supabase = createClientComponentClient();
      console.log('Fetching projects for agency:', data.activeAgencyId, 'client:', clientId);
      
      try {
        if (clientId) {
          // Get projects for specific client
          const { data: projectsData, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('client_id', clientId);
            
          if (error) {
            console.error('Error fetching client projects:', error);
            return;
          }
            
          console.log('Client projects result:', projectsData?.length || 0);
          
          if (projectsData && projectsData.length > 0) {
            // Validate project IDs before setting
            const validProjects = projectsData.filter(p => p && typeof p.id === 'number');
            console.log('Valid projects:', validProjects.length);
            
            if (validProjects.length > 0) {
              updateData({ projects: validProjects });
            } else {
              console.warn('No valid projects found for client:', clientId);
            }
          } else {
            console.warn('No projects found for client:', clientId);
          }
        } else {
          // Get any project from the agency to use for new tasks
          const { data: projectsData, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('agency_id', data.activeAgencyId)
            .limit(5);
          
          if (error) {
            console.error('Error fetching agency projects:', error);
            return;
          }
            
          console.log('Agency projects result:', projectsData?.length || 0);
          
          if (projectsData && projectsData.length > 0) {
            // Validate project IDs before setting
            const validProjects = projectsData.filter(p => p && typeof p.id === 'number');
            console.log('Valid projects:', validProjects.length);
            
            if (validProjects.length > 0) {
              updateData({ projects: validProjects });
            } else {
              console.warn('No valid projects found for agency:', data.activeAgencyId);
            }
          } else {
            console.warn('No projects found for agency:', data.activeAgencyId);
          }
        }
      } catch (err) {
        console.error('Exception fetching projects:', err);
      }
    };
    
    if (data.activeAgencyId) {
      getProjects();
    }
  }, [data.activeAgencyId, clientId]);
  
  // Fetch tasks and apply filters
  const fetchTasks = async () => {
    if (!data.activeAgencyId) return;
    
    try {
      let clientTasks: TaskModel[] = [];
      
      if (clientId) {
        // Get tasks for specific client
        clientTasks = await TaskService.getTasksByClientId(clientId);
      } else {
        // Get tasks for entire agency
        clientTasks = await TaskService.getTasksByAgencyId(data.activeAgencyId);
      }
      
      // Sort by status, priority and due date
      const sortedTasks = clientTasks.sort((a, b) => {
        // First sort by status (todo first)
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Finally sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return a.dueDate ? -1 : 1; // Items with due dates come first
      });
      
      updateData({ tasks: sortedTasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error("Failed to load follow-ups");
      updateData({ error: 'Failed to load follow-ups.' });
    } finally {
      updateData({ isLoading: false });
    }
  };
  
  // Fetch communication logs
  const fetchCommunicationLogs = async () => {
    if (!data.activeAgencyId) return;
    
    try {
      let logs: CommunicationLogModel[] = [];
      
      if (clientId) {
        logs = await CommunicationLogService.getLogsByClientId(clientId);
      } else if (data.activeAgencyId) {
        logs = await CommunicationLogService.getLogsByAgencyId(data.activeAgencyId);
      }
      
      updateData({ communicationLogs: logs });
    } catch (error) {
      console.error('Failed to fetch communication logs:', error);
      updateData({ error: 'Failed to load communication logs.' });
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (data.activeAgencyId) {
      fetchTasks();
      fetchCommunicationLogs();
    }
  }, [data.activeAgencyId, clientId]);
  
  // Get filtered tasks
  const getFilteredTasks = (): TaskModel[] => {
    if (!data.tasks.length) return [];
    
    let result = [...data.tasks];
    
    // Apply text search
    if (data.searchQuery) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(data.searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(data.searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    switch (data.activeFilter) {
      case 'upcoming':
        result = result.filter(task => 
          task.status !== 'completed' && 
          task.dueDate && 
          new Date(task.dueDate) >= new Date() && 
          !isToday(new Date(task.dueDate))
        );
        break;
      case 'overdue':
        result = result.filter(task => 
          task.status !== 'completed' && 
          task.dueDate && 
          isPast(new Date(task.dueDate)) && 
          !isToday(new Date(task.dueDate))
        );
        break;
      case 'completed':
        result = result.filter(task => task.status === 'completed');
        break;
      case 'high':
        result = result.filter(task => task.priority === 'high' && task.status !== 'completed');
        break;
      // 'all' doesn't need filtering
    }
    
    return result;
  };
  
  // Task operations
  const handleComplete = async (taskId: number) => {
    try {
      await TaskService.completeTask(taskId);
      // Update local state
      updateData({
        tasks: data.tasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      });
      toast.success("Task marked as completed");
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error("Failed to update task");
    }
  };
  
  const handleSnooze = async (taskId: number, days: number) => {
    try {
      const task = data.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const currentDueDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const newDueDate = addDays(currentDueDate, days);
      
      await TaskService.updateTask({
        id: taskId,
        dueDate: newDueDate.toISOString()
      });
      
      // Update local state
      updateData({
        tasks: data.tasks.map(task => 
          task.id === taskId ? { ...task, dueDate: newDueDate.toISOString() } : task
        )
      });
      
      toast.success(`Task snoozed for ${days} day${days !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to snooze task:', error);
      toast.error("Failed to update task");
    }
  };
  
  const createTask = async (input: Omit<CreateTaskInput, 'agencyId' | 'createdByUserId' | 'projectId'>) => {
    // Validate required data with detailed errors
    if (!data.userId) {
      console.error('Cannot create task: Missing user ID');
      toast.error("Missing user information. Please sign in again.");
      return false;
    }
    
    if (!data.activeAgencyId) {
      console.error('Cannot create task: Missing agency ID');
      toast.error("Missing agency information. Please refresh the page.");
      return false;
    }
    
    // Check for projects with detailed logging
    if (!data.projects.length) {
      console.error('Cannot create task: No projects available', {
        clientId,
        agencyId: data.activeAgencyId,
        projectsArray: data.projects
      });
      toast.error("No projects available. Please create a project first.");
      return false;
    }
    
    // Get the first project with validation
    const selectedProject = data.projects[0];
    if (!selectedProject || typeof selectedProject.id !== 'number') {
      console.error('Cannot create task: Invalid project data', selectedProject);
      toast.error("Invalid project data. Please create a valid project.");
      return false;
    }
    
    console.log('Creating task with project:', selectedProject);
    
    const newTask: CreateTaskInput = {
      ...input,
      projectId: selectedProject.id,
      agencyId: data.activeAgencyId,
      createdByUserId: data.userId
    };
    
    try {
      console.log('Submitting task creation with data:', newTask);
      await TaskService.createTask(newTask);
      toast.success("Follow-up created successfully");
      fetchTasks(); // Refresh task list
      return true;
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error("Failed to create follow-up");
      updateData({ error: 'Failed to create follow-up.' });
      return false;
    }
  };
  
  const logCommunication = async (input: Omit<CreateCommunicationLogInput, 'agencyId' | 'createdByUserId' | 'clientId'>) => {
    if (!data.userId || !data.activeAgencyId) {
      toast.error("Missing user or agency information");
      return false;
    }
    
    const targetClientId = clientId || 0; // In a real implementation, you'd need to have a valid client ID
    
    if (!targetClientId) {
      toast.error("No client selected for communication log");
      return false;
    }
    
    const newLog: CreateCommunicationLogInput = {
      ...input,
      clientId: targetClientId,
      agencyId: data.activeAgencyId,
      createdByUserId: data.userId
    };
    
    try {
      await CommunicationLogService.createLog(newLog);
      toast.success("Communication logged successfully");
      fetchCommunicationLogs(); // Refresh logs
      return true;
    } catch (error) {
      console.error('Failed to log communication:', error);
      toast.error("Failed to log communication");
      updateData({ error: 'Failed to log communication.' });
      return false;
    }
  };
  
  return {
    ...data,
    filteredTasks: getFilteredTasks(),
    setActiveFilter,
    setSearchQuery,
    handleComplete,
    handleSnooze,
    createTask,
    logCommunication,
    fetchTasks,
    fetchCommunicationLogs
  };
} 
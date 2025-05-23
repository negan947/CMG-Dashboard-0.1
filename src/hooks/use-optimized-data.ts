import useSWR, { SWRConfiguration, mutate } from 'swr';
import { TaskService } from '@/services/task-service';
import { ClientService } from '@/services/client-service';
import { ProjectService } from '@/services/project-service';
import { toast } from 'sonner';

/**
 * Default SWR configuration for optimized data fetching
 */
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  onError: (error) => {
    console.error('Data fetching error:', error);
    toast.error('Failed to load data. Please try again.');
  },
};

/**
 * Generic fetcher function with error handling
 */
async function fetcher<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  }
}

/**
 * Hook for fetching tasks with optimized caching
 */
export function useTasks(
  type: 'client' | 'project' | 'agency',
  id?: number,
  config?: SWRConfiguration
) {
  const key = id ? `tasks-${type}-${id}` : null;
  
  return useSWR(
    key,
    async () => {
      if (!id) return [];
      
      switch (type) {
        case 'client':
          return await TaskService.getTasksByClientId(id);
        case 'project':
          return await TaskService.getTasksByProjectId(id);
        case 'agency':
          return await TaskService.getTasksByAgencyId(id);
        default:
          throw new Error(`Invalid task type: ${type}`);
      }
    },
    { ...defaultConfig, ...config }
  );
}

/**
 * Hook for fetching clients with optimized caching
 */
export function useClients(agencyId?: number, config?: SWRConfiguration) {
  const key = agencyId ? `clients-${agencyId}` : 'clients-all';
  
  return useSWR(
    key,
    () => ClientService.getClients(agencyId),
    { ...defaultConfig, ...config }
  );
}

/**
 * Hook for fetching a single client
 */
export function useClient(clientId?: number, config?: SWRConfiguration) {
  const key = clientId ? `client-${clientId}` : null;
  
  return useSWR(
    key,
    async () => {
      if (!clientId) return null;
      return await ClientService.getClientById(clientId);
    },
    { ...defaultConfig, ...config }
  );
}

/**
 * Hook for fetching projects with optimized caching
 */
export function useProjects(
  type: 'client' | 'agency',
  id?: number,
  config?: SWRConfiguration
) {
  const key = id ? `projects-${type}-${id}` : null;
  
  return useSWR(
    key,
    async () => {
      if (!id) return [];
      
      switch (type) {
        case 'client':
          return await ProjectService.getProjectsByClientId(id);
        case 'agency':
          return await ProjectService.getProjectsByAgencyId(id);
        default:
          throw new Error(`Invalid project type: ${type}`);
      }
    },
    { ...defaultConfig, ...config }
  );
}

/**
 * Optimistic update helper for tasks
 */
export async function updateTaskOptimistic(
  taskId: number,
  updates: Partial<{ status: string; dueDate: string }>,
  mutateKey: string
) {
  // Optimistically update the cache
  await mutate(
    mutateKey,
    (currentData: any) => {
      if (!currentData) return currentData;
      
      return currentData.map((task: any) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
    },
    false // Don't revalidate immediately
  );
  
  try {
    // Perform the actual update
    await TaskService.updateTask({ id: taskId, ...updates });
    
    // Revalidate to ensure consistency
    await mutate(mutateKey);
  } catch (error) {
    // Revert on error
    await mutate(mutateKey);
    throw error;
  }
}

/**
 * Prefetch data for better perceived performance
 */
export async function prefetchClientData(clientId: number) {
  // Prefetch client details
  mutate(`client-${clientId}`, ClientService.getClientById(clientId));
  
  // Prefetch related data
  mutate(`tasks-client-${clientId}`, TaskService.getTasksByClientId(clientId));
  mutate(`projects-client-${clientId}`, ProjectService.getProjectsByClientId(clientId));
}

/**
 * Clear all cached data for a specific entity
 */
export function clearEntityCache(entityType: 'client' | 'project' | 'task', entityId: number) {
  const patterns = [
    `${entityType}-${entityId}`,
    `${entityType}s-`,
    `tasks-${entityType}-${entityId}`,
  ];
  
  // Clear all matching cache keys
  patterns.forEach(pattern => {
    mutate(
      (key: string) => typeof key === 'string' && key.includes(pattern),
      undefined,
      { revalidate: true }
    );
  });
} 
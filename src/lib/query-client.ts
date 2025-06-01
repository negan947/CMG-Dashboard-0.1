import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus only if data is stale
      refetchOnWindowFocus: 'always',
      // Don't refetch on reconnect unless stale
      refetchOnReconnect: 'always',
    },
  },
}); 
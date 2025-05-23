import { useState, useEffect } from 'react';
import { ClientModel, ClientStatus } from '@/types/models.types';
import { ClientService } from '@/services/client-service';
import { useProfile } from './use-profile';
import { toast } from 'sonner';

export function useClients() {
  const { profile, currentAgencyId } = useProfile();
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clients when the profile loads
  useEffect(() => {
    const fetchClients = async () => {
      // Wait for the agency ID to be available from useProfile()
      if (!currentAgencyId) {
        console.log('Waiting for agencyId to be available...');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching clients for agency ID: ${currentAgencyId}`);
        const fetchedClients = await ClientService.getClientsByAgencyId(currentAgencyId);
        console.log(`Fetched ${fetchedClients.length} clients`);
        setClients(fetchedClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again.');
        toast.error('Failed to load clients');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAgencyId) {
      fetchClients();
    }
  }, [currentAgencyId]); // Only depend on currentAgencyId, not profile

  // Return filtered clients
  const getActiveClients = () => {
    return clients.filter(client => client.status === ClientStatus.ACTIVE);
  };

  // Get a single client by id
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id) || null;
  };

  return {
    clients,
    isLoading,
    error,
    getActiveClients,
    getClientById
  };
} 
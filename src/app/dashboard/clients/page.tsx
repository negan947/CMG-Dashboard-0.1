import { ClientServiceServer } from '@/services/client-service-server';
import ClientPage from './client';

export default async function ClientsPage() {
  // Fetch data on the server
  // Default to agency ID 3 for server-side fetch
  const agencyId = 3; 
  
  // Get clients for this agency using the server-side service
  const clientModels = await ClientServiceServer.getClientsByAgencyId(agencyId);
  
  // Format clients with initials
  const initialClients = clientModels.map(client => ({
    ...client,
    initials: client.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase(),
  }));
  
  return <ClientPage initialClients={initialClients} />;
}
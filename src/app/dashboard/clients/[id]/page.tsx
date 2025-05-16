import { ClientFollowUps } from '@/components/dashboard/clients/ClientFollowUps';

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  // Assume clientData contains the client information
  const clientId = parseInt(params.id);

  return (
    <div>
      {/* Existing client details UI */}
      
      {/* Client Follow-ups Section */}
      <ClientFollowUps clientId={clientId} />
      
      {/* Other client detail sections */}
    </div>
  );
} 
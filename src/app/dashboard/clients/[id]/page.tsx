import { ClientFollowUps } from '@/components/dashboard/clients/ClientFollowUps';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params in Next.js 15
  const resolvedParams = await params;
  const clientId = parseInt(resolvedParams.id);

  return (
    <div>
      {/* Existing client details UI */}
      
      {/* Client Follow-ups Section */}
      <ClientFollowUps clientId={clientId} />
      
      {/* Other client detail sections */}
    </div>
  );
} 
'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid hydration issues
const ClientsContent = dynamic(
  () => import('@/app/dashboard/clients/page'),
  { ssr: false } // This prevents server-side rendering to avoid hydration mismatch
);

export default function ClientsPage() {
  return <ClientsContent />;
} 
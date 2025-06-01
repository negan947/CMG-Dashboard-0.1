import { InvoiceService } from '@/services/invoice-service';
import { InvoiceModel } from '@/types/models.types';
import InvoicesClient from './page';

// This is a Server Component - no 'use client' directive
export default async function InvoicesPage() {
  // Note: The client component doesn't actually accept these props,
  // so we're just returning the component directly.
  return <InvoicesClient />;
} 
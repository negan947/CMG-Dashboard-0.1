import { InvoiceService } from '@/services/invoice-service';
import { InvoiceModel } from '@/types/models.types';
import InvoicesClient from './client-page';

// This is a Server Component - no 'use client' directive
export default async function InvoicesPage() {
  // Fetch initial data on the server
  let initialInvoices: InvoiceModel[] = [];
  let error: string | null = null;

  try {
    // This runs on the server during the request
    initialInvoices = await InvoiceService.getInvoices();
  } catch (e) {
    console.error('Failed to fetch invoices on server:', e);
    error = 'Failed to load invoices';
  }

  // Pass the pre-fetched data to the client component
  return <InvoicesClient initialInvoices={initialInvoices} error={error} />;
} 
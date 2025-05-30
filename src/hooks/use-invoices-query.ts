import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvoiceService } from '@/services/invoice-service';
import { InvoiceModel, CreateInvoiceInput, UpdateInvoiceInput } from '@/types/models.types';
import { toast } from 'sonner';

const QUERY_KEYS = {
  invoices: ['invoices'],
  invoice: (id: number) => ['invoice', id],
  invoicesByClient: (clientId: number) => ['invoices', 'client', clientId],
  invoicesByProject: (projectId: number) => ['invoices', 'project', projectId],
};

export function useInvoicesQuery(agencyId?: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.invoices, agencyId],
    queryFn: () => InvoiceService.getInvoices(agencyId),
    // Keep the data fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Cache for 5 minutes
    cacheTime: 5 * 60 * 1000,
  });
}

export function useInvoiceQuery(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.invoice(id),
    queryFn: () => InvoiceService.getInvoiceById(id),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceInput) => InvoiceService.createInvoice(data),
    onSuccess: (newInvoice) => {
      // Invalidate and refetch invoices list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices });
      // Add the new invoice to the cache immediately
      queryClient.setQueryData<InvoiceModel[]>(
        QUERY_KEYS.invoices,
        (old) => old ? [...old, newInvoice] : [newInvoice]
      );
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create invoice');
      console.error('Create invoice error:', error);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInvoiceInput) => InvoiceService.updateInvoice(data),
    onSuccess: (updatedInvoice) => {
      // Update the specific invoice in cache
      queryClient.setQueryData(
        QUERY_KEYS.invoice(parseInt(updatedInvoice.id)),
        updatedInvoice
      );
      // Invalidate the list to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices });
      toast.success('Invoice updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update invoice');
      console.error('Update invoice error:', error);
    },
  });
}

// Pre-fetch invoices data (useful for hovering over navigation)
export function usePrefetchInvoices() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.invoices,
      queryFn: () => InvoiceService.getInvoices(),
      staleTime: 2 * 60 * 1000,
    });
  };
} 
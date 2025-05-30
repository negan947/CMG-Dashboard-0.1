import { useState, useEffect, useCallback } from 'react';
import { InvoiceService } from '@/services/invoice-service';
import { InvoiceModel, InvoiceItemModel, InvoiceStatus, CreateInvoiceInput, UpdateInvoiceInput, CreateInvoiceItemInput, UpdateInvoiceItemInput } from '@/types/models.types';
import { toast } from 'sonner';
import { useProfile } from './use-profile';

/**
 * Custom hook for working with invoices
 */
export function useInvoices(clientId?: number, projectId?: number) {
  const [invoices, setInvoices] = useState<InvoiceModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentAgencyId } = useProfile();

  // Fetch invoices based on provided filters
  const fetchInvoices = useCallback(async () => {
    if (!currentAgencyId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedInvoices: InvoiceModel[] = [];
      
      if (projectId) {
        // Fetch invoices for specific project
        fetchedInvoices = await InvoiceService.getInvoicesByProjectId(projectId);
      } else if (clientId) {
        // Fetch invoices for specific client
        fetchedInvoices = await InvoiceService.getInvoicesByClientId(clientId);
      } else {
        // Fetch all invoices for current agency
        fetchedInvoices = await InvoiceService.getInvoices(currentAgencyId);
      }
      
      setInvoices(fetchedInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  }, [currentAgencyId, clientId, projectId]);

  // Get invoice details including items
  const fetchInvoiceDetails = async (invoiceId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const invoice = await InvoiceService.getInvoiceById(invoiceId);
      const items = await InvoiceService.getInvoiceItems(invoiceId);
      
      return { invoice, items };
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice details');
      return { invoice: null, items: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new invoice with items in a single transaction
  const createInvoiceWithItems = async (
    invoiceData: Omit<CreateInvoiceInput, 'agencyId'>,
    items: Omit<CreateInvoiceItemInput, 'invoiceId'>[]
  ) => {
    if (!currentAgencyId) {
      setError('Agency ID is required to create an invoice');
      toast.error('Missing agency information');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await InvoiceService.createInvoiceWithItems(
        { ...invoiceData, agencyId: currentAgencyId },
        items.map(item => ({ ...item, invoiceId: 0 })) // invoiceId will be set in service
      );
      
      // Add the new invoice to the state
      setInvoices(prev => [result.invoice, ...prev]);
      toast.success('Invoice created successfully with PDF generated');
      
      return result;
    } catch (err) {
      console.error('Error creating invoice with items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new invoice
  const createInvoice = async (data: Omit<CreateInvoiceInput, 'agencyId'>) => {
    if (!currentAgencyId) {
      setError('Agency ID is required to create an invoice');
      toast.error('Missing agency information');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newInvoice = await InvoiceService.createInvoice({
        ...data,
        agencyId: currentAgencyId
      });
      
      // Add the new invoice to the state
      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('Invoice created successfully');
      
      return newInvoice;
    } catch (err) {
      console.error('Error creating invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF for an existing invoice
  const generateInvoicePdf = async (invoiceId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const pdfUrl = await InvoiceService.generateInvoicePdf(invoiceId);
      
      if (pdfUrl) {
        // Update the invoice in state with the new PDF URL
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId.toString() ? { ...inv, pdf_url: pdfUrl } : inv
        ));
        toast.success('PDF generated successfully');
        return pdfUrl;
      } else {
        toast.error('Failed to generate PDF');
        return null;
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing invoice
  const updateInvoice = async (data: UpdateInvoiceInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedInvoice = await InvoiceService.updateInvoice(data);
      
      // Update the invoice in the state
      setInvoices(prev => prev.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      ));
      
      toast.success('Invoice updated successfully');
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an invoice
  const deleteInvoice = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await InvoiceService.deleteInvoice(id);
      
      // Remove the deleted invoice from the state
      setInvoices(prev => prev.filter(inv => inv.id !== id.toString()));
      
      toast.success('Invoice deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting invoice:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (id: number, status: InvoiceStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedInvoice = await InvoiceService.updateInvoiceStatus(id, status);
      
      // Update the invoice in the state
      setInvoices(prev => prev.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      ));
      
      toast.success(`Invoice marked as ${status}`);
      return updatedInvoice;
    } catch (err) {
      console.error('Error updating invoice status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark invoice as paid
  const markInvoiceAsPaid = async (id: number, paymentDate?: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedInvoice = await InvoiceService.markInvoiceAsPaid(id, paymentDate);
      
      // Update the invoice in the state
      setInvoices(prev => prev.map(inv => 
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      ));
      
      toast.success('Invoice marked as paid');
      return updatedInvoice;
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark invoice as paid';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new invoice item
  const createInvoiceItem = async (data: CreateInvoiceItemInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newItem = await InvoiceService.createInvoiceItem(data);
      toast.success('Invoice item added');
      return newItem;
    } catch (err) {
      console.error('Error creating invoice item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add invoice item';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing invoice item
  const updateInvoiceItem = async (data: UpdateInvoiceItemInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItem = await InvoiceService.updateInvoiceItem(data);
      toast.success('Invoice item updated');
      return updatedItem;
    } catch (err) {
      console.error('Error updating invoice item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice item';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an invoice item
  const deleteInvoiceItem = async (id: number, invoiceId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await InvoiceService.deleteInvoiceItem(id, invoiceId);
      toast.success('Invoice item removed');
      return true;
    } catch (err) {
      console.error('Error deleting invoice item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove invoice item';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load invoices when the component mounts or dependencies change
  useEffect(() => {
    if (currentAgencyId) {
      fetchInvoices();
    }
  }, [currentAgencyId, clientId, projectId, fetchInvoices]);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    fetchInvoiceDetails,
    createInvoiceWithItems,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    markInvoiceAsPaid,
    createInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,
    generateInvoicePdf,
  };
} 
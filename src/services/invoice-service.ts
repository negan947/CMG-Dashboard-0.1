import { 
  InvoiceModel, 
  InvoiceItemModel, 
  InvoiceStatus, 
  CreateInvoiceInput, 
  UpdateInvoiceInput,
  CreateInvoiceItemInput,
  UpdateInvoiceItemInput 
} from '@/types/models.types';
import { mapDbRow, camelToSnakeObject } from '@/lib/data-mapper';
import { createClient } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error-handling';
import { User } from '@supabase/auth-helpers-nextjs';

/**
 * Service for managing invoice data using direct Supabase client
 */
export const InvoiceService = {
  /**
   * Get all invoices (optionally filtered by agency ID)
   */
  async getInvoices(agencyId?: number): Promise<InvoiceModel[]> {
    const supabase = createClient();
    try {
      let query = supabase.from('invoices').select(`
        *,
        clients(name)
      `);
      
      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }
      
      const { data, error } = await query.order('issue_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((row) => {
        const invoice = mapDbRow(row);
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = row.clients.name;
        }
        return invoice as InvoiceModel;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get invoices for a specific client
   */
  async getInvoicesByClientId(clientId: number): Promise<InvoiceModel[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(name)
        `)
        .eq('client_id', clientId)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((row) => {
        const invoice = mapDbRow(row);
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = row.clients.name;
        }
        return invoice as InvoiceModel;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get invoices for a specific project
   */
  async getInvoicesByProjectId(projectId: number): Promise<InvoiceModel[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(name)
        `)
        .eq('project_id', projectId)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((row) => {
        const invoice = mapDbRow(row);
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = row.clients.name;
        }
        return invoice as InvoiceModel;
      });
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoiceById(id: number): Promise<InvoiceModel | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }
      
      if (!data) return null;
      
      const invoice = mapDbRow(data) as InvoiceModel;
      
      // Add clientName from the joined table
      if (data.clients) {
        invoice.clientName = data.clients.name;
      }
      
      return invoice;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get all items for an invoice
   */
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItemModel[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(row => mapDbRow(row) as InvoiceItemModel);
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Create a new invoice
   */
  async createInvoice(input: CreateInvoiceInput): Promise<InvoiceModel> {
    const supabase = createClient();
    try {
      // Convert camelCase to snake_case for database
      const dbInput = camelToSnakeObject(input);
      
      // Insert the invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert(dbInput)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Update an existing invoice
   */
  async updateInvoice(input: UpdateInvoiceInput): Promise<InvoiceModel> {
    const supabase = createClient();
    try {
      const { id, ...updateData } = input;
      
      // Convert camelCase to snake_case for database
      const dbInput = camelToSnakeObject(updateData);
      
      // Update the invoice
      const { data, error } = await supabase
        .from('invoices')
        .update(dbInput)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: number): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<InvoiceModel> {
    const supabase = createClient();
    try {
      // Special handling for paid status - set payment date
      const updateData: any = { status };
      
      if (status === InvoiceStatus.PAID) {
        updateData.payment_date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      }
      
      // Update the invoice
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(id: number, paymentDate?: Date): Promise<InvoiceModel> {
    const supabase = createClient();
    try {
      const updateData = {
        status: InvoiceStatus.PAID,
        payment_date: paymentDate 
          ? paymentDate.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
      };
      
      // Update the invoice
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Create a new invoice item
   */
  async createInvoiceItem(input: CreateInvoiceItemInput): Promise<InvoiceItemModel> {
    const supabase = createClient();
    try {
      // Calculate total amount if not provided
      if (!input.totalAmount && input.quantity && input.unitPrice) {
        input.totalAmount = input.quantity * input.unitPrice;
      }
      
      // Convert camelCase to snake_case for database
      const dbInput = camelToSnakeObject(input);
      
      // Insert the invoice item
      const { data, error } = await supabase
        .from('invoice_items')
        .insert(dbInput)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceItemModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Update an existing invoice item
   */
  async updateInvoiceItem(input: UpdateInvoiceItemInput): Promise<InvoiceItemModel> {
    const supabase = createClient();
    try {
      const { id, ...updateData } = input;
      
      // Calculate total amount if not provided
      if (!updateData.totalAmount && updateData.quantity && updateData.unitPrice) {
        updateData.totalAmount = updateData.quantity * updateData.unitPrice;
      }
      
      // Convert camelCase to snake_case for database
      const dbInput = camelToSnakeObject(updateData);
      
      // Update the invoice item
      const { data, error } = await supabase
        .from('invoice_items')
        .update(dbInput)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbRow(data) as InvoiceItemModel;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Delete an invoice item
   */
  async deleteInvoiceItem(id: number, invoiceId: number): Promise<boolean> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', id)
        .eq('invoice_id', invoiceId); // Double check the invoice ID for security
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  },

  /**
   * Get invoice statistics for dashboard
   */
  async getInvoiceStats(agencyId: number): Promise<{
    total: number;
    paid: number;
    overdue: number;
    draft: number;
  }> {
    const supabase = createClient();
    try {
      // Get all invoices for this agency
      const { data, error } = await supabase
        .from('invoices')
        .select('status, total_amount')
        .eq('agency_id', agencyId);
      
      if (error) throw error;
      
      // Calculate statistics
      const stats = {
        total: 0,
        paid: 0,
        overdue: 0,
        draft: 0
      };
      
      if (data && data.length > 0) {
        data.forEach(invoice => {
          const amount = parseFloat(invoice.total_amount as any);
          stats.total += amount;
          
          switch (invoice.status) {
            case InvoiceStatus.PAID:
              stats.paid += amount;
              break;
            case InvoiceStatus.OVERDUE:
              stats.overdue += amount;
              break;
            case InvoiceStatus.DRAFT:
              stats.draft += amount;
              break;
          }
        });
      }
      
      return stats;
    } catch (error) {
      throw handleSupabaseError(error);
    }
  }
}; 
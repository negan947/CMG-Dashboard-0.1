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
import { sanitizeSearchQuery } from '@/lib/utils';
import { User } from '@supabase/auth-helpers-nextjs';
import { PostgrestError } from '@supabase/supabase-js';

// Define a new interface that extends InvoiceModel to include clientName
interface InvoiceModelWithClient extends InvoiceModel {
  clientName: string;
}

// Define the InvoiceService interface to fix self-reference type issue
interface InvoiceServiceType {
  getInvoices(agencyId?: number): Promise<InvoiceModelWithClient[]>;
  getInvoicesByClientId(clientId: number): Promise<InvoiceModelWithClient[]>;
  getInvoicesByProjectId(projectId: number): Promise<InvoiceModelWithClient[]>;
  getInvoiceById(id: number): Promise<InvoiceModel | null>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItemModel[]>;
  createInvoice(input: CreateInvoiceInput): Promise<InvoiceModel>;
  generateInvoicePdf(invoiceId: number): Promise<string | null>;
  createInvoiceWithItems(
    invoiceInput: CreateInvoiceInput,
    items: CreateInvoiceItemInput[]
  ): Promise<{ invoice: InvoiceModel; items: InvoiceItemModel[] }>;
  updateInvoice(input: UpdateInvoiceInput): Promise<InvoiceModel>;
  deleteInvoice(id: number): Promise<boolean>;
  updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<InvoiceModel>;
  markInvoiceAsPaid(id: number, paymentDate?: Date): Promise<InvoiceModel>;
  createInvoiceItem(input: CreateInvoiceItemInput): Promise<InvoiceItemModel>;
  updateInvoiceItem(input: UpdateInvoiceItemInput): Promise<InvoiceItemModel>;
  deleteInvoiceItem(id: number, invoiceId: number): Promise<boolean>;
  getInvoiceStats(agencyId: number): Promise<{
    total: number;
    paid: number;
    overdue: number;
    draft: number;
  }>;
  searchInvoices(query: string): Promise<InvoiceModelWithClient[]>;
  getInstance(): InvoiceServiceType;
}

/**
 * Service for managing invoice data using direct Supabase client
 */
export const InvoiceService: InvoiceServiceType = {
  /**
   * Get all invoices (optionally filtered by agency ID)
   */
  async getInvoices(agencyId?: number): Promise<InvoiceModelWithClient[]> {
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
        const invoice = mapDbRow(row) as InvoiceModelWithClient;
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = (row.clients as any).name;
        } else {
          invoice.clientName = 'Unknown Client';
        }
        return invoice;
      });
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  },

  /**
   * Get invoices for a specific client
   */
  async getInvoicesByClientId(clientId: number): Promise<InvoiceModelWithClient[]> {
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
        const invoice = mapDbRow(row) as InvoiceModelWithClient;
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = (row.clients as any).name;
        } else {
          invoice.clientName = 'Unknown Client';
        }
        return invoice;
      });
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  },

  /**
   * Get invoices for a specific project
   */
  async getInvoicesByProjectId(projectId: number): Promise<InvoiceModelWithClient[]> {
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
        const invoice = mapDbRow(row) as InvoiceModelWithClient;
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = (row.clients as any).name;
        } else {
          invoice.clientName = 'Unknown Client';
        }
        return invoice;
      });
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
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
        .select(
          `
          id,
          invoice_number,
          client_id,
          project_id,
          agency_id,
          status,
          issue_date,
          due_date,
          payment_date,
          subtotal,
          tax_amount,
          tax_rate,
          discount_amount,
          discount_type,
          total_amount,
          notes,
          payment_method,
          footer_text,
          created_by_user_id,
          created_at,
          updated_at,
          pdf_url,
          client: clients(
            id,
            name,
            email,
            phone,
            avatar_url
          ),
          items: invoice_items(
            id,
            invoice_id,
            description,
            quantity,
            unit_price,
            tax_rate,
            discount_amount,
            total_amount,
            sort_order
          )
          `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      if (!data) return null;

      // Manually map the top-level invoice data and attach nested data
      // Assuming mapDbRow is for top-level fields.
      const invoice = mapDbRow(data) as InvoiceModel; // Apply top-level mapping

      // Attach nested client and items, ensuring they are also mapped if necessary
      // Assuming the nested objects/arrays returned by the select are already in a usable format,
      // or mapDbRow can handle deep mapping (less likely). Manual nested mapping might be needed.

      // For now, directly attach the nested data fetched by the query.
      // We need to ensure the nested fields in the DB response (e.g., client.avatar_url) are mapped to camelCase (client.avatarUrl)
      // If mapDbRow doesn't handle nested objects, manual mapping of nested fields is required here.

      // Let's assume for now that the aliased nested fields are returned in camelCase or mapDbRow handles deep structure.
      // If not, this will need adjustment.

      // A safer approach would be to manually map nested objects if mapDbRow is only for top-level.
      // Example manual nested mapping (if needed):
      /*
      if (data.client) {
          invoice.client = mapDbRow(data.client) as ClientModel;
      }
      if (data.items) {
          invoice.items = data.items.map((item: any) => mapDbRow(item) as InvoiceItemModel);
      }
      */

      // Directly attach the fetched nested data - REQUIRES mapDbRow or the query to handle nested camelCasing.
      (invoice as any).client = data.client; // Attach client data fetched with alias
      (invoice as any).items = data.items;   // Attach items data fetched with alias


      // clientName is likely not needed in the full InvoiceModel, but keep for compatibility if other parts use it.
      // If other parts need it, ensure it's mapped.
      // For the InvoiceModel used in the viewer, the full client object is available.

      return invoice;
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  },

  /**
   * Create a new invoice with automatic PDF generation
   */
  async createInvoice(input: CreateInvoiceInput): Promise<InvoiceModel> {
    const supabase = createClient();
    try {
      // Generate invoice number using database function if not provided
      let invoiceNumber = input.invoiceNumber;
      if (!invoiceNumber) {
        const { data: generatedNumber, error: numberError } = await supabase
          .rpc('generate_invoice_number', { agency_id_param: input.agencyId });

        if (numberError) {
          console.warn('Failed to generate invoice number via DB function, falling back to manual generation');
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          invoiceNumber = `INV-${year}${month}-${randomDigits}`;
        } else {
          invoiceNumber = generatedNumber;
        }
      }

      // Convert camelCase to snake_case for database
      const dbInput = camelToSnakeObject({
        ...input,
        invoiceNumber
      });

      // Insert the invoice
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .insert(dbInput)
        .select()
        .single();

      if (error) throw error;

      const invoice = mapDbRow(invoiceData) as InvoiceModel;

      // Generate PDF immediately after creation (don't fail if PDF generation fails)
      try {
        const pdfUrl = await this.generateInvoicePdf(parseInt(invoice.id));
        if (pdfUrl) {
          console.log('✓ PDF generated successfully during invoice creation');
        }
      } catch (pdfError) {
        console.warn('⚠️ PDF generation failed during invoice creation (invoice still created):', pdfError instanceof Error ? pdfError.message : pdfError);
        // Don't fail the invoice creation if PDF generation fails
        // PDF can be regenerated later or manually
      }

      return invoice;
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  },

  /**
   * Generate PDF for an existing invoice
   */
  async generateInvoicePdf(invoiceId: number): Promise<string | null> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/generate-pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.pdfUrl || null;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  },

  /**
   * Create invoice with items in a single transaction
   */
  async createInvoiceWithItems(
    invoiceInput: CreateInvoiceInput,
    items: CreateInvoiceItemInput[]
  ): Promise<{ invoice: InvoiceModel; items: InvoiceItemModel[] }> {
    const supabase = createClient();

    try {
      // Start transaction by creating invoice first
      const invoice = await this.createInvoice(invoiceInput);
      const invoiceId = parseInt(invoice.id);

      // Create all items
      const createdItems: InvoiceItemModel[] = [];
      for (const [index, itemInput] of items.entries()) {
        const item = await this.createInvoiceItem({
          ...itemInput,
          invoiceId,
          sortOrder: index + 1
        });
        createdItems.push(item);
      }

      // Recalculate totals and update invoice
      const itemsTotal = createdItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const taxAmount = itemsTotal * (invoice.taxRate / 100);
      const totalAmount = itemsTotal + taxAmount - (invoice.discountAmount || 0);

      const updatedInvoice = await this.updateInvoice({
        id: invoiceId,
        subtotal: itemsTotal,
        taxAmount,
        totalAmount
      });

      return { invoice: updatedInvoice, items: createdItems };
    } catch (error) {
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
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
      throw handleSupabaseError(error as PostgrestError | Error);
    }
  },

  /**
   * Search invoices by invoice number, client name, or amount
   */
  async searchInvoices(query: string): Promise<InvoiceModelWithClient[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Sanitize the query to prevent SQL injection
    const safeQuery = sanitizeSearchQuery(query);
    if (!safeQuery) {
      return [];
    }
    
    const searchPattern = `%${safeQuery}%`;
    const supabase = createClient();
    try {
      // Get invoices where invoice_number contains the search term
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(id, name)
        `)
        .ilike('invoice_number', searchPattern)
        .limit(10);
      
      if (error) {
        console.error('Error searching invoices:', error);
        return [];
      }
      
      // Map the results
      const results = (data || []).map(row => {
        const invoice = mapDbRow(row) as InvoiceModelWithClient;
        // Add clientName from the joined table
        if (row.clients) {
          invoice.clientName = (row.clients as any).name;
        } else {
          invoice.clientName = 'Unknown Client';
        }
        return invoice;
      });
      
      return results;
    } catch (err) {
      console.error('Unexpected error searching invoices:', err);
      return [];
    }
  },

  /**
   * Get singleton instance (to match the expected interface in search-store)
   */
  getInstance(): InvoiceServiceType {
    return this;
  }
}; 
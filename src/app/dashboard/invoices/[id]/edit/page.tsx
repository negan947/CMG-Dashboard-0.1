'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/use-invoices';
import { InvoiceModel, InvoiceItemModel, InvoiceStatus, UpdateInvoiceInput } from '@/types/models.types';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Plus, Trash2, FileText, X, Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Invoice form schema
const invoiceFormSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  projectId: z.number().optional().nullable(),
  status: z.string(),
  issueDate: z.date(),
  dueDate: z.date(),
  paymentDate: z.date().optional().nullable(),
  taxRate: z.number().min(0).max(100).default(0),
  discountAmount: z.number().min(0).default(0),
  discountType: z.enum(['fixed', 'percentage']).default('fixed'),
  notes: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  footerText: z.string().optional().nullable(),
  items: z.array(z.object({
    id: z.number().optional(),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be at least 0'),
    taxRate: z.number().min(0).max(100).default(0),
    discountAmount: z.number().min(0).default(0),
    totalAmount: z.number().optional(),
    sortOrder: z.number().default(0),
  }))
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function EditInvoicePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  const { fetchInvoiceDetails, updateInvoice, updateInvoiceItem, createInvoiceItem, deleteInvoiceItem } = useInvoices();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      id: 0,
      clientId: 0,
      projectId: null,
      status: InvoiceStatus.DRAFT,
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      paymentDate: null,
      taxRate: 0,
      discountAmount: 0,
      discountType: 'fixed',
      notes: '',
      paymentMethod: '',
      footerText: '',
      items: []
    }
  });
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items'
  });
  
  // Format currency consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Calculate totals based on current form values
  const calculateTotals = () => {
    const items = form.getValues('items') || [];
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const taxRate = form.getValues('taxRate') || 0;
    const taxAmount = subtotal * (taxRate / 100);
    
    const discountAmount = form.getValues('discountAmount') || 0;
    const discountType = form.getValues('discountType');
    
    let finalDiscountAmount = discountAmount;
    if (discountType === 'percentage') {
      finalDiscountAmount = subtotal * (discountAmount / 100);
    }
    
    const total = subtotal + taxAmount - finalDiscountAmount;
    
    return { subtotal, taxAmount, discountAmount: finalDiscountAmount, total };
  };
  
  // Update item total when quantity or price changes
  const updateItemTotal = (index: number) => {
    const items = form.getValues('items');
    if (!items[index]) return;
    
    const quantity = items[index].quantity || 0;
    const unitPrice = items[index].unitPrice || 0;
    const totalAmount = quantity * unitPrice;
    
    const updatedItem = {
      ...items[index],
      totalAmount
    };
    
    update(index, updatedItem);
  };
  
  // Fetch invoice details on page load
  useEffect(() => {
    const loadInvoiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const invoiceId = parseInt(params.id);
        const { invoice, items } = await fetchInvoiceDetails(invoiceId);
        
        if (!invoice) {
          setError('Invoice not found');
          return;
        }
        
        // Prepare form values
        const formValues: InvoiceFormValues = {
          id: parseInt(invoice.id),
          clientId: parseInt(invoice.clientId),
          projectId: invoice.projectId ? parseInt(invoice.projectId) : null,
          status: invoice.status,
          issueDate: new Date(invoice.issueDate),
          dueDate: new Date(invoice.dueDate),
          paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : null,
          taxRate: invoice.taxRate || 0,
          discountAmount: invoice.discountAmount || 0,
          discountType: invoice.discountType || 'fixed',
          notes: invoice.notes,
          paymentMethod: invoice.paymentMethod,
          footerText: invoice.footerText,
          items: items.map(item => ({
            id: parseInt(item.id),
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate || 0,
            discountAmount: item.discountAmount || 0,
            totalAmount: item.totalAmount,
            sortOrder: item.sortOrder || 0
          }))
        };
        
        // Reset form with invoice data
        form.reset(formValues);
      } catch (err) {
        console.error('Error loading invoice details:', err);
        setError('Failed to load invoice details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvoiceDetails();
  }, [params.id, fetchInvoiceDetails, form]);
  
  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Update the invoice
      const invoiceData: UpdateInvoiceInput = {
        id: data.id,
        clientId: data.clientId,
        projectId: data.projectId,
        status: data.status as InvoiceStatus,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
        paymentDate: data.paymentDate ? data.paymentDate.toISOString() : null,
        taxRate: data.taxRate,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        footerText: data.footerText
      };
      
      const updatedInvoice = await updateInvoice(invoiceData);
      
      if (!updatedInvoice) {
        throw new Error('Failed to update invoice');
      }
      
      // Update or create each item
      for (const item of data.items) {
        if (item.id) {
          // Update existing item
          await updateInvoiceItem({
            id: item.id,
            invoiceId: data.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountAmount: item.discountAmount,
            totalAmount: item.quantity * item.unitPrice,
            sortOrder: item.sortOrder
          });
        } else {
          // Create new item
          await createInvoiceItem({
            invoiceId: data.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountAmount: item.discountAmount,
            totalAmount: item.quantity * item.unitPrice,
            sortOrder: item.sortOrder
          });
        }
      }
      
      toast.success('Invoice updated successfully');
      router.push(`/dashboard/invoices/${data.id}`);
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      toast.error('Failed to update invoice');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle item deletion
  const handleDeleteItem = async (index: number, itemId?: number) => {
    if (itemId) {
      try {
        const invoiceId = form.getValues('id');
        await deleteInvoiceItem(itemId, invoiceId);
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
        return;
      }
    }
    
    remove(index);
  };
  
  // Add a new blank item
  const addNewItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discountAmount: 0,
      totalAmount: 0,
      sortOrder: fields.length
    });
  };
  
  // Background elements
  const backgroundElements = (
    <>
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      <div className={cn(
        "fixed inset-0 -z-9 opacity-[0.05] pointer-events-none",
        isDark ? "block" : "hidden"
      )} style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }} />
    </>
  );
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        {backgroundElements}
        <div className="relative z-10 py-2 p-4 md:p-6">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-400 dark:bg-blue-600 mb-4"></div>
              <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="relative min-h-screen">
        {backgroundElements}
        <div className="relative z-10 py-2 p-4 md:p-6">
          <GlassCard contentClassName="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.push('/dashboard/invoices')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className={cn(
                "text-2xl font-bold",
                isDark ? "text-zinc-100" : "text-gray-800"
              )}>
                Error
              </h1>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-xl font-medium text-red-500 mb-2">
                {error}
              </p>
              <p className="text-muted-foreground mb-6">
                We couldn't load the invoice for editing.
              </p>
              <Button onClick={() => router.push('/dashboard/invoices')}>
                Return to Invoices
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }
  
  // Calculate current totals
  const { subtotal, taxAmount, discountAmount, total } = calculateTotals();
  
  return (
    <div className="relative min-h-screen">
      {backgroundElements}
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="relative z-10 py-2 p-4 md:p-6 space-y-6">
          {/* Header with actions */}
          <GlassCard contentClassName="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  type="button"
                  onClick={() => router.back()}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className={cn(
                    "text-2xl font-bold md:text-3xl",
                    isDark ? "text-zinc-100" : "text-gray-800"
                  )}>
                    Edit Invoice
                  </h1>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    Make changes to your invoice details and items
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:ml-auto">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </GlassCard>
          
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main invoice content */}
            <div className="md:col-span-2 space-y-6">
              {/* General info */}
              <GlassCard contentClassName="p-6">
                <h2 className="text-xl font-semibold mb-4">Invoice Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientId">Client</Label>
                      <Controller
                        name="clientId"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="clientId"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="projectId">Project (Optional)</Label>
                      <Controller
                        name="projectId"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="projectId"
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={InvoiceStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={InvoiceStatus.SENT}>Sent</SelectItem>
                              <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                              <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                              <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Controller
                        name="issueDate"
                        control={form.control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                  isDark ? "bg-zinc-800/70" : "bg-white"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Controller
                        name="dueDate"
                        control={form.control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                  isDark ? "bg-zinc-800/70" : "bg-white"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                    </div>
                    
                    {form.watch('status') === InvoiceStatus.PAID && (
                      <div>
                        <Label htmlFor="paymentDate">Payment Date</Label>
                        <Controller
                          name="paymentDate"
                          control={form.control}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    isDark ? "bg-zinc-800/70" : "bg-white"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
              
              {/* Invoice items */}
              <GlassCard contentClassName="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Invoice Items</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground mb-4">No items added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addNewItem}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Description</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[5%]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fields.map((field, index) => (
                            <TableRow key={field.id}>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.description`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      placeholder="Item description"
                                      className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.quantity`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className={cn("text-right", isDark ? "bg-zinc-800/70" : "bg-white")}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.unitPrice`}
                                  control={form.control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className={cn("text-right", isDark ? "bg-zinc-800/70" : "bg-white")}
                                      onChange={(e) => {
                                        field.onChange(parseFloat(e.target.value) || 0);
                                        updateItemTotal(index);
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  (form.watch(`items.${index}.quantity`) || 0) * 
                                  (form.watch(`items.${index}.unitPrice`) || 0)
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(index, form.getValues(`items.${index}.id`))}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </GlassCard>
              
              {/* Notes */}
              <GlassCard contentClassName="p-6">
                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Controller
                      name="notes"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="notes"
                          placeholder="Additional notes for the client..."
                          className={cn("min-h-32", isDark ? "bg-zinc-800/70" : "bg-white")}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Controller
                      name="footerText"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="footerText"
                          placeholder="Text to appear at the bottom of the invoice..."
                          className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment details */}
              <GlassCard contentClassName="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Controller
                      name="paymentMethod"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="paymentMethod"
                          placeholder="e.g. Bank Transfer, PayPal, etc."
                          className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Controller
                      name="taxRate"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="taxRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discountAmount">Discount</Label>
                      <Controller
                        name="discountAmount"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="discountAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Controller
                        name="discountType"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id="discountType" className={cn(isDark ? "bg-zinc-800/70" : "bg-white")}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                              <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">
                      Tax ({form.watch('taxRate')}%):
                    </span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">
                      Discount
                      {form.watch('discountType') === 'percentage' 
                        ? ` (${form.watch('discountAmount')}%)` 
                        : ''}:
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </GlassCard>
              
              {/* Status */}
              <GlassCard contentClassName="p-6">
                <h2 className="text-xl font-semibold mb-4">Status</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current Status:</span>
                    <Badge 
                      variant={
                        form.watch('status') === InvoiceStatus.PAID ? "default" : 
                        form.watch('status') === InvoiceStatus.OVERDUE ? "destructive" :
                        form.watch('status') === InvoiceStatus.DRAFT ? "outline" : 
                        "secondary"
                      }
                      className="capitalize"
                    >
                      {form.watch('status')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={form.watch('status') === InvoiceStatus.DRAFT ? "default" : "outline"}
                      onClick={() => form.setValue('status', InvoiceStatus.DRAFT)}
                      className="w-full"
                    >
                      Draft
                    </Button>
                    
                    <Button
                      type="button"
                      variant={form.watch('status') === InvoiceStatus.SENT ? "default" : "outline"}
                      onClick={() => form.setValue('status', InvoiceStatus.SENT)}
                      className="w-full"
                    >
                      Sent
                    </Button>
                    
                    <Button
                      type="button"
                      variant={form.watch('status') === InvoiceStatus.PAID ? "default" : "outline"}
                      onClick={() => form.setValue('status', InvoiceStatus.PAID)}
                      className="w-full"
                    >
                      Paid
                    </Button>
                    
                    <Button
                      type="button"
                      variant={form.watch('status') === InvoiceStatus.OVERDUE ? "default" : "outline"}
                      onClick={() => form.setValue('status', InvoiceStatus.OVERDUE)}
                      className="w-full"
                    >
                      Overdue
                    </Button>
                  </div>
                </div>
              </GlassCard>
              
              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.back()}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 
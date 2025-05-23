'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/use-invoices';
import { useProfile } from '@/hooks/use-profile';
import { InvoiceModel, InvoiceStatus } from '@/types/models.types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  FilePlus, FileText, Filter, Search, 
  CreditCard, Calendar, ArrowUpDown, Download, 
  FileUp, MoreHorizontal, X, Check, User 
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientSelect } from '@/components/clients/ClientSelect';
import { ClientModel } from '@/types/models.types';

// Placeholder components until we create them
const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <Badge 
    variant={
      status === InvoiceStatus.PAID ? "default" : 
      status === InvoiceStatus.OVERDUE ? "destructive" :
      status === InvoiceStatus.DRAFT ? "outline" : 
      status === InvoiceStatus.SENT ? "secondary" : 
      "outline"
    }
    className="capitalize"
  >
    {status}
  </Badge>
);

const InvoiceActionMenu = ({ 
  invoice, 
  onView, 
  onEdit, 
  onDelete, 
  onMarkAsPaid, 
  onStatusChange 
}: { 
  invoice: InvoiceModel, 
  onView: () => void, 
  onEdit: () => void, 
  onDelete: () => void, 
  onMarkAsPaid: () => void,
  onStatusChange: (status: InvoiceStatus) => void
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Invoice actions menu">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onView}>View Invoice</DropdownMenuItem>
      <DropdownMenuItem onClick={onEdit}>Edit Invoice</DropdownMenuItem>
      <DropdownMenuItem onClick={onMarkAsPaid} disabled={invoice.status === InvoiceStatus.PAID}>
        Mark as Paid
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
        Delete Invoice
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const InvoiceViewer = ({ invoice }: { invoice: InvoiceModel }) => (
  <div className="p-4 border rounded-md">
    <h3 className="text-lg font-semibold mb-4">Invoice Preview</h3>
    <p className="text-sm mb-2">This is a placeholder for the invoice viewer component.</p>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm font-medium">Invoice Number</p>
        <p>{invoice.invoiceNumber}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Client ID</p>
        <p>{invoice.clientId}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Issue Date</p>
        <p>{format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Due Date</p>
        <p>{format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Status</p>
        <InvoiceStatusBadge status={invoice.status} />
      </div>
      <div>
        <p className="text-sm font-medium">Total Amount</p>
        <p>${invoice.totalAmount.toFixed(2)}</p>
      </div>
    </div>
    <Button variant="outline" className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  </div>
);

const AddInvoiceModal = ({ 
  isOpen, 
  onClose, 
  onInvoiceCreated 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onInvoiceCreated: (invoice: InvoiceModel) => void 
}) => {
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createInvoice, createInvoiceItem } = useInvoices();
  
  // Form state
  const [selectedClient, setSelectedClient] = useState<ClientModel | null>(null);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState([{ description: "", quantity: 1, price: 0 }]);
  const [notes, setNotes] = useState("");
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    
    if (items.some(item => !item.description.trim() || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Please complete all item fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate totals
      const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const calculatedTax = calculatedSubtotal * 0.1; // 10% tax
      const calculatedTotal = calculatedSubtotal + calculatedTax;
      
      // Generate a unique invoice number - format: INV-{YY}{MM}-{Random 4 digits}
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      const invoiceNumber = `INV-${year}${month}-${randomDigits}`;
      
      // Create a new invoice object
      const newInvoice = {
        clientId: parseInt(selectedClient.id),
        invoiceNumber,
        issueDate: issueDate, // Send as string in YYYY-MM-DD format
        dueDate: dueDate, // Send as string in YYYY-MM-DD format
        status: InvoiceStatus.DRAFT,
        totalAmount: calculatedTotal,
        subtotal: calculatedSubtotal,
        taxAmount: calculatedTax,
        taxRate: 10, // 10%
        notes
      };
      
      console.log('Creating invoice:', newInvoice);
      
      // Call the createInvoice function from useInvoices
      const createdInvoice = await createInvoice(newInvoice);
      
      if (createdInvoice) {
        // Create invoice items one by one
        const invoiceId = parseInt(createdInvoice.id);
        console.log('Created invoice with ID:', invoiceId);
        
        const itemPromises = items.map((item, index) => 
          createInvoiceItem({
            invoiceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.price,
            totalAmount: item.quantity * item.price,
            sortOrder: index + 1
          })
        );
        
        await Promise.all(itemPromises);
        console.log('Created all invoice items');
        
        toast.success("Invoice created successfully");
        onInvoiceCreated(createdInvoice);
      } else {
        toast.error("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("An error occurred while creating the invoice");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clear form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Reset form after closing animation completes
      const timeout = setTimeout(() => {
        setSelectedClient(null);
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setItems([{ description: "", quantity: 1, price: 0 }]);
        setNotes("");
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[650px] max-h-[90vh] overflow-y-auto",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FilePlus className="mr-2 h-5 w-5 text-primary" />
            Create New Invoice
          </DialogTitle>
          <DialogDescription>
            Create a new invoice for your client. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {/* Client and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Client</label>
              <ClientSelect 
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
                className={cn(
                  "h-10 w-full", 
                  isDark ? "bg-zinc-800/70 border-zinc-700" : ""
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <Input 
                type="date" 
                value={issueDate} 
                onChange={(e) => setIssueDate(e.target.value)} 
                className={isDark ? "bg-zinc-800/70" : ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className={isDark ? "bg-zinc-800/70" : ""}
              />
            </div>
          </div>
          
          {/* Client Preview */}
          {selectedClient && (
            <div className={cn(
              "p-3 rounded-md border",
              isDark ? "bg-zinc-800/30 border-zinc-700" : "bg-gray-50 border-gray-200"
            )}>
              <div className="flex items-center">
                {selectedClient.avatarUrl ? (
                  <img 
                    src={selectedClient.avatarUrl} 
                    alt={selectedClient.name} 
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className={cn(
                    "w-10 h-10 rounded-full mr-3 flex items-center justify-center",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )}>
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-medium">{selectedClient.name}</h3>
                  <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                    {selectedClient.email && (
                      <span className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedClient.email}
                      </span>
                    )}
                    {selectedClient.phone && (
                      <span className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedClient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-medium">Line Items</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addItem}
                className="h-8"
              >
                Add Item
              </Button>
            </div>
            
            <div className={cn(
              "rounded-md border",
              isDark ? "border-zinc-800" : "border-gray-200"
            )}>
              <div className={cn(
                "grid grid-cols-12 gap-2 px-3 py-2 text-sm font-medium",
                isDark ? "bg-zinc-800/50" : "bg-gray-50"
              )}>
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Price</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="divide-y divide-border">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                    <div className="col-span-6">
                      <Input 
                        type="text" 
                        value={item.description} 
                        onChange={(e) => updateItem(index, "description", e.target.value)} 
                        className={cn("h-8", isDark ? "bg-zinc-800/70" : "")}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        min="1"
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)} 
                        className={cn("h-8", isDark ? "bg-zinc-800/70" : "")}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.price} 
                        onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)} 
                        className={cn("h-8", isDark ? "bg-zinc-800/70" : "")}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="h-8 w-8"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Totals */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md min-h-[80px]",
                isDark 
                  ? "bg-zinc-800/70 border-zinc-700 text-zinc-100" 
                  : "bg-white border-gray-300 text-gray-900"
              )}
              placeholder="Additional notes or payment instructions..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>Create Invoice</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function InvoicesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  const { profile, isLoading: profileLoading } = useProfile();
  const { 
    invoices, 
    isLoading: invoicesLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    markInvoiceAsPaid
  } = useInvoices();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'due'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Format currency consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle sorting
  const handleSort = (field: 'date' | 'amount' | 'due') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      // Status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const invoiceNumber = invoice.invoiceNumber?.toLowerCase() || '';
        return invoiceNumber.includes(query);
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'date') {
        return direction * (new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
      } else if (sortField === 'amount') {
        return direction * (a.totalAmount - b.totalAmount);
      } else if (sortField === 'due') {
        return direction * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      }
      
      return 0;
    });

  // Handle invoice actions
  const handleViewInvoice = (invoice: InvoiceModel) => {
    setCurrentInvoice(invoice);
    setIsViewerOpen(true);
  };

  const handleEditInvoice = (invoice: InvoiceModel) => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDeleteInvoice = async (invoice: InvoiceModel) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }
    
    const id = parseInt(invoice.id);
    const success = await deleteInvoice(id);
    
    if (success) {
      toast.success('Invoice deleted successfully');
    }
  };

  const handleMarkAsPaid = async (invoice: InvoiceModel) => {
    const id = parseInt(invoice.id);
    await markInvoiceAsPaid(id);
  };

  const handleStatusChange = async (invoice: InvoiceModel, status: InvoiceStatus) => {
    const id = parseInt(invoice.id);
    await updateInvoiceStatus(id, status);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortField('date');
    setSortDirection('desc');
  };

  const handleInvoiceCreated = (newInvoice: InvoiceModel) => {
    setIsCreateModalOpen(false);
    toast.success('Invoice created successfully');
    router.push(`/dashboard/invoices/${newInvoice.id}`);
  };

  // Background styling
  const backgroundElements = (
    <>
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark 
          ? "bg-gradient-to-br from-[#0F0F12] via-[#171720] to-[#1C1C25]" 
          : "bg-gradient-to-br from-[#E8EDFF] via-[#F0F5FF] to-[#F5F9FF]"
      )} />
      
      <div className={cn(
        "fixed -top-20 -left-20 -z-5 h-72 w-72 rounded-full blur-[100px]",
        isDark ? "bg-purple-900 opacity-[0.15]" : "bg-purple-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed top-1/3 right-1/4 -z-5 h-60 w-60 rounded-full blur-[80px]",
        isDark ? "bg-blue-900 opacity-[0.15]" : "bg-blue-400 opacity-[0.18]"
      )} />
      <div className={cn(
        "fixed bottom-1/4 -right-10 -z-5 h-48 w-48 rounded-full blur-[70px]",
        isDark ? "bg-fuchsia-900 opacity-[0.1]" : "bg-pink-300 opacity-[0.15]"
      )} />
      <div className={cn(
        "fixed top-2/3 left-1/4 -z-5 h-36 w-36 rounded-full blur-[60px]",
        isDark ? "bg-indigo-900 opacity-[0.1]" : "bg-indigo-400 opacity-[0.15]"
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

  return (
    <div className="relative min-h-screen">
      {backgroundElements}

      <div className="space-y-6 md:space-y-8 relative z-10 py-2 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <FileText className={cn("h-8 w-8", isDark ? "text-blue-400" : "text-blue-600")} />
            <h1 className={cn(
              "text-2xl font-bold md:text-3xl",
              isDark ? "text-zinc-100" : "text-gray-800"
            )}>
              Invoices
            </h1>
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className={cn("md:ml-auto group")}
          >
            <FilePlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Create Invoice
          </Button>
        </div>

        {/* Filters */}
        <GlassCard contentClassName="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input          placeholder="Search invoices..."          value={searchQuery}          onChange={(e) => setSearchQuery(e.target.value)}          className={cn("pl-8", isDark ? "bg-zinc-800/70" : "bg-white")}        />        {searchQuery && (          <button             className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"            onClick={() => setSearchQuery('')}            aria-label="Clear search"          >            <X className="h-4 w-4" />          </button>        )}
            </div>
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status {statusFilter !== 'all' && <Badge variant="secondary" className="ml-1 capitalize">{statusFilter}</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Invoices
                      {statusFilter === 'all' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(InvoiceStatus.DRAFT)}>
                      Draft
                      {statusFilter === InvoiceStatus.DRAFT && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(InvoiceStatus.SENT)}>
                      Sent
                      {statusFilter === InvoiceStatus.SENT && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(InvoiceStatus.PAID)}>
                      Paid
                      {statusFilter === InvoiceStatus.PAID && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(InvoiceStatus.OVERDUE)}>
                      Overdue
                      {statusFilter === InvoiceStatus.OVERDUE && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter(InvoiceStatus.CANCELLED)}>
                      Cancelled
                      {statusFilter === InvoiceStatus.CANCELLED && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuLabel>Sort invoices</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleSort('date')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Date {sortField === 'date' && (sortDirection === 'asc' ? '(Oldest)' : '(Newest)')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('amount')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Amount {sortField === 'amount' && (sortDirection === 'asc' ? '(Low-High)' : '(High-Low)')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('due')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Due Date {sortField === 'due' && (sortDirection === 'asc' ? '(Earliest)' : '(Latest)')}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {(searchQuery || statusFilter !== 'all' || sortField !== 'date' || sortDirection !== 'desc') && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Invoices Table */}
        <GlassCard contentClassName="p-0 overflow-hidden">
          {invoicesLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-blue-400 dark:bg-blue-600 mb-4"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No invoices match your filters' 
                  : 'No invoices found'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create Your First Invoice
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className={isDark ? "bg-zinc-800/50" : "bg-gray-50"}>
                <TableRow>
                  <TableHead className="w-[180px]">Invoice Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className={cn(
                      "cursor-pointer group",
                      isDark ? 
                        "hover:bg-zinc-800/40 focus:bg-zinc-800/50" : 
                        "hover:bg-gray-50 focus:bg-gray-100"
                    )}
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>Client #{invoice.clientId}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div onClick={(e) => e.stopPropagation()}>
                        <InvoiceActionMenu 
                          invoice={invoice} 
                          onView={() => handleViewInvoice(invoice)}
                          onEdit={() => handleEditInvoice(invoice)}
                          onDelete={() => handleDeleteInvoice(invoice)}
                          onMarkAsPaid={() => handleMarkAsPaid(invoice)}
                          onStatusChange={(status) => handleStatusChange(invoice, status)}
                        />
          </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </GlassCard>
      </div>

      {/* Create Invoice Modal */}
      <AddInvoiceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />

      {/* Invoice Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Invoice {currentInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              {currentInvoice && "Invoice details and status information"}
            </DialogDescription>
            {currentInvoice && (
              <div className="flex items-center mt-2 space-x-2">
                <InvoiceStatusBadge status={currentInvoice.status} />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(currentInvoice.issueDate), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
          </DialogHeader>
          {currentInvoice && <InvoiceViewer invoice={currentInvoice} />}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
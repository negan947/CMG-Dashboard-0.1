'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useInvoices } from '@/hooks/use-invoices';
import { InvoiceModel, InvoiceItemModel, InvoiceStatus } from '@/types/models.types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowLeft, Download, Edit, FileText, CreditCard, 
  Calendar, Printer, Send, CheckCircle, MoreHorizontal, 
  Calendar as CalendarIcon, User, CircleDollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
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
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Helper component for invoice status badge
const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => (
  <Badge 
    variant={
      status === InvoiceStatus.PAID ? "default" : 
      status === InvoiceStatus.OVERDUE ? "destructive" :
      status === InvoiceStatus.DRAFT ? "outline" : 
      status === InvoiceStatus.SENT ? "secondary" : 
      "outline"
    }
    className={cn("capitalize px-3 py-1", 
      status === InvoiceStatus.PAID ? "bg-green-600 hover:bg-green-700" : "",
      status === InvoiceStatus.OVERDUE ? "bg-red-600 hover:bg-red-700" : ""
    )}
  >
    {status}
  </Badge>
);

export default function InvoiceDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme !== 'light';
  
  const { fetchInvoiceDetails, updateInvoiceStatus, markInvoiceAsPaid } = useInvoices();
  
  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  
  // Resolve params on component mount
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setInvoiceId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);
  
  // Format currency consistently
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Fetch invoice details on page load
  useEffect(() => {
    if (!invoiceId) return;
    
    const loadInvoiceDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const parsedInvoiceId = parseInt(invoiceId);
        const { invoice, items } = await fetchInvoiceDetails(parsedInvoiceId);
        
        if (!invoice) {
          setError('Invoice not found');
          return;
        }
        
        setInvoice(invoice);
        setInvoiceItems(items);
      } catch (err) {
        console.error('Error loading invoice details:', err);
        setError('Failed to load invoice details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInvoiceDetails();
  }, [invoiceId, fetchInvoiceDetails]);
  
  // Handle status change
  const handleStatusChange = async (status: InvoiceStatus) => {
    if (!invoice) return;
    
    try {
      const updatedInvoice = await updateInvoiceStatus(parseInt(invoice.id), status);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
        toast.success(`Invoice marked as ${status}`);
      }
    } catch (err) {
      console.error('Error updating invoice status:', err);
      toast.error('Failed to update invoice status');
    }
  };
  
  // Handle mark as paid
  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    
    try {
      const updatedInvoice = await markInvoiceAsPaid(parseInt(invoice.id));
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
        toast.success('Invoice marked as paid');
      }
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
      toast.error('Failed to mark invoice as paid');
    }
  };
  
  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const taxAmount = invoice?.taxAmount || 0;
  const discountAmount = invoice?.discountAmount || 0;
  const total = (invoice?.totalAmount || subtotal + taxAmount - discountAmount);
  
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
  if (error || !invoice) {
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
                {error || "Invoice not found"}
              </p>
              <p className="text-muted-foreground mb-6">
                We couldn't find the invoice you're looking for.
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
  
  return (
    <div className="relative min-h-screen">
      {backgroundElements}
      
      <div className="relative z-10 py-2 p-4 md:p-6 space-y-6">
        {/* Header with actions */}
        <GlassCard contentClassName="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.push('/dashboard/invoices')}
                aria-label="Back to invoices"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className={cn(
                  "text-2xl font-bold md:text-3xl",
                  isDark ? "text-zinc-100" : "text-gray-800"
                )}>
                  Invoice {invoice.invoiceNumber}
                </h1>
                <div className="flex items-center mt-2">
                  <InvoiceStatusBadge status={invoice.status} />
                  <span className={cn(
                    "ml-3 text-sm",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    Issued on {format(new Date(invoice.issueDate), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      aria-label="Print invoice"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print Invoice</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      aria-label="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                variant="outline"
                disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.PAID}
                onClick={handleMarkAsPaid}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
              
              <Button
                variant={(invoice.status as InvoiceStatus) === InvoiceStatus.DRAFT ? "default" : "outline"}
                disabled={(invoice.status as InvoiceStatus) !== InvoiceStatus.DRAFT}
                onClick={() => handleStatusChange(InvoiceStatus.SENT)}
              >
                <Send className="h-4 w-4 mr-2" />
                {(invoice.status as InvoiceStatus) === InvoiceStatus.DRAFT ? "Send Invoice" : "Sent"}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.DRAFT} 
                    onClick={() => handleStatusChange(InvoiceStatus.DRAFT)}>
                    Mark as Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.PAID} 
                    onClick={() => handleStatusChange(InvoiceStatus.PAID)}>
                    Mark as Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.OVERDUE} 
                    onClick={() => handleStatusChange(InvoiceStatus.OVERDUE)}>
                    Mark as Overdue
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.CANCELLED} 
                    onClick={() => handleStatusChange(InvoiceStatus.CANCELLED)}>
                    Mark as Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </GlassCard>
        
        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main invoice content */}
          <div className="md:col-span-2 space-y-6">
            {/* Client and billing info */}
            <GlassCard contentClassName="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={cn(
                    "text-sm font-medium mb-2",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    Bill To
                  </h3>
                  <h4 className="text-lg font-semibold mb-1">
                    Client #{invoice.clientId}
                  </h4>
                  <div className={cn(
                    "text-sm",
                    isDark ? "text-zinc-300" : "text-gray-600"
                  )}>
                    <p>123 Client Street</p>
                    <p>Client City, State 12345</p>
                    <p>client@example.com</p>
                  </div>
                </div>
                
                <div>
                  <h3 className={cn(
                    "text-sm font-medium mb-2",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}>
                    Invoice Details
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 opacity-70" />
                      <span className="text-sm font-medium">Issue Date:</span>
                      <span className="text-sm ml-auto">
                        {format(new Date(invoice.issueDate), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 opacity-70" />
                      <span className="text-sm font-medium">Due Date:</span>
                      <span className="text-sm ml-auto">
                        {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    {invoice.paymentDate && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 opacity-70" />
                        <span className="text-sm font-medium">Payment Date:</span>
                        <span className="text-sm ml-auto">
                          {format(new Date(invoice.paymentDate), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    {invoice.paymentMethod && (
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 opacity-70" />
                        <span className="text-sm font-medium">Payment Method:</span>
                        <span className="text-sm ml-auto">{invoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
            
            {/* Invoice items table */}
            <GlassCard contentClassName="p-0 overflow-hidden">
              <Table>
                <TableHeader className={isDark ? "bg-zinc-800/50" : "bg-gray-50"}>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceItems.length > 0 ? (
                    invoiceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter className={isDark ? "bg-zinc-800/50" : "bg-gray-50"}>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right">Subtotal</TableCell>
                    <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                  </TableRow>
                  {taxAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right">
                        Tax ({(invoice.taxRate || 0).toFixed(2)}%)
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                    </TableRow>
                  )}
                  {discountAmount > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right">
                        Discount
                        {invoice.discountType === 'percentage' && ` (${invoice.discountAmount}%)`}
                      </TableCell>
                      <TableCell className="text-right">-{formatCurrency(discountAmount)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </GlassCard>
            
            {/* Notes */}
            {invoice.notes && (
              <GlassCard contentClassName="p-6">
                <h3 className={cn(
                  "text-sm font-medium mb-2",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                  Notes
                </h3>
                <p className={cn(
                  "text-sm whitespace-pre-line",
                  isDark ? "text-zinc-300" : "text-gray-600"
                )}>
                  {invoice.notes}
                </p>
              </GlassCard>
            )}
            
            {/* Footer text */}
            {invoice.footerText && (
              <GlassCard contentClassName="p-6">
                <p className={cn(
                  "text-sm text-center",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}>
                  {invoice.footerText}
                </p>
              </GlassCard>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
                <CardDescription>Invoice payment status and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tax</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {(invoice.status as InvoiceStatus) !== InvoiceStatus.PAID ? (
                  <Button 
                    className="w-full" 
                    onClick={handleMarkAsPaid}
                    disabled={(invoice.status as InvoiceStatus) === InvoiceStatus.PAID}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                ) : (
                  <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-800 dark:text-green-500">
                      Paid on {invoice.paymentDate ? format(new Date(invoice.paymentDate), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                )}
                
                {(invoice.status as InvoiceStatus) === InvoiceStatus.DRAFT && (
                  <Button
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleStatusChange(InvoiceStatus.SENT)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Action cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <Card className="bg-transparent backdrop-blur-sm border border-zinc-800/20">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 mt-2">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Download PDF</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Download a PDF copy of this invoice
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Download
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-transparent backdrop-blur-sm border border-zinc-800/20">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 mt-2">
                    <Edit className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Edit Invoice</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Make changes to this invoice
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
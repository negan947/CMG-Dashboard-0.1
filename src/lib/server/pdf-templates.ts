import { InvoiceModel, InvoiceItemModel, ClientModel } from '@/types/models.types';
import { format } from 'date-fns';

interface InvoicePdfData {
  invoice: InvoiceModel;
  client: ClientModel; // Assuming we'll fetch client data
  items: InvoiceItemModel[];
}

export function generateInvoicePdfHtml(data: InvoicePdfData): string {
  const { invoice, client, items } = data;

  // Basic styling - ideally this would use Tailwind or consistent CSS
  const styles = `
    body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20mm; }
    .container { max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .header h1 { color: #3b82f6; }
    .address { margin-bottom: 20px; }
    .address p { margin: 0; }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .item-table th, .item-table td { border: 1px solid #eee; padding: 10px; text-align: left; }
    .item-table th { background-color: #f9f9f9; }
    .totals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; justify-items: end; }
    .total-row { display: flex; justify-content: space-between; width: 200px; }
    .total-row span:first-child { font-weight: bold; }
    .notes { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
  `;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const itemRows = items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right;">${formatCurrency(item.totalAmount)}</td>
    </tr>
  `).join('');

  return `
    <html>
    <head>
      <title>Invoice #${invoice.invoiceNumber}</title>
      <style>${styles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>Invoice</h1>
            <p>#${invoice.invoiceNumber}</p>
          </div>
          <div>
            {/* Agency Info Placeholder */}
            <p>Your Agency Name</p>
            <p>Your Address</p>
            <p>Your Contact Info</p>
          </div>
        </div>

        <div class="address">
          <p><strong>Bill To:</strong></p>
          <p>${client.name}</p>
          ${client.address ? `<p>${client.address}</p>` : ''}
          ${client.city || client.state || client.zipCode ? `<p>${client.city}, ${client.state} ${client.zipCode}</p>` : ''}
          ${client.country ? `<p>${client.country}</p>` : ''}
          ${client.email ? `<p>${client.email}</p>` : ''}
          ${client.phone ? `<p>${client.phone}</p>` : ''}
        </div>

        <div class="details-grid">
          <div>
            <p><strong>Issue Date:</strong> ${format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p><strong>Due Date:</strong> ${format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</p>
          </div>
          ${invoice.paymentDate ? `
          <div>
            <p><strong>Payment Date:</strong> ${format(new Date(invoice.paymentDate), 'MMMM d, yyyy')}</p>
          </div>
          ` : ''}
           ${invoice.projectId ? `
           <div>
             <p><strong>Project ID:</strong> ${invoice.projectId}</p>
           </div>
           ` : ''}
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals-grid">
           <div class="total-row">
             <span>Subtotal:</span>
             <span>${formatCurrency(invoice.subtotal)}</span>
           </div>
           ${invoice.discountAmount > 0 ? `
              <div class="total-row">
                 <span>Discount:</span>
                 <span>-${formatCurrency(invoice.discountAmount)}</span>
              </div>
           ` : ''}
           <div class="total-row">
             <span>Tax (${invoice.taxRate}%):</span>
             <span>${formatCurrency(invoice.taxAmount)}</span>
           </div>
           <div class="total-row">
             <span>Total:</span>
             <span>${formatCurrency(invoice.totalAmount)}</span>
           </div>
        </div>

        ${invoice.notes ? `
        <div class="notes">
          <p><strong>Notes:</strong></p>
          <p>${invoice.notes}</p>
        </div>
        ` : ''}
        
        ${invoice.footerText ? `
        <div class="notes">
          <p>${invoice.footerText}</p>
        </div>
        ` : ''}

      </div>
    </body>
    </html>
  `;
} 
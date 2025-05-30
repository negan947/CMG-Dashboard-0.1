import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { generateInvoicePdfHtml } from '@/lib/server/pdf-templates';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

// Define types for API route parameters
interface GeneratePdfParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: GeneratePdfParams
) {
  const resolvedParams = await params;
  const invoiceId = parseInt(resolvedParams.id, 10);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
  }

  try {
    // Step 1: Create admin client (fallback to anonymous client)
    console.log('Step 1: Creating client...');
    let supabase;
    
    try {
      supabase = createAdminClient();
      console.log('✓ Admin client created successfully');
    } catch (error: any) {
      console.warn('Admin client failed, using anonymous client for PDF generation:', error.message);
      // Fallback to anonymous client for PDF generation
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = 'https://mkmvxrgfjzogxhbzvgxk.supabase.co';
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXZ4cmdmanpvZ3hoYnp2Z3hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MzY5ODAsImV4cCI6MjA1NzUxMjk4MH0.D02rogTgil1lrLmlDZ9FyWFwQODykZkJzV3dEDTzA5M';
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✓ Anonymous client created as fallback');
    }

    // Step 2: Fetch invoice with nested data
    console.log('Step 2: Fetching invoice with nested data...');
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client: clients(*),
        items: invoice_items(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      console.error('✗ Error fetching invoice:', invoiceError);
      return NextResponse.json(
        { error: `Database error: ${invoiceError.message}` },
        { status: 500 }
      );
    }

    if (!invoice) {
      console.log('✗ Invoice not found');
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('✓ Invoice fetched successfully:', invoice.invoice_number);
    console.log('✓ Client:', invoice.client?.name || 'No client');
    console.log('✓ Items count:', invoice.items?.length || 0);

    // Step 3: Generate HTML
    console.log('Step 3: Generating HTML for PDF...');
    const htmlContent = generateInvoicePdfHtml({
      invoice: invoice,
      client: invoice.client,
      items: invoice.items || [],
    });
    console.log('✓ HTML generated, length:', htmlContent.length);

    // Step 4: Generate PDF using Puppeteer
    console.log('Step 4: Generating PDF from HTML...');
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    if (!pdfBuffer) {
        throw new Error('Failed to generate PDF buffer');
    }
    console.log('✓ PDF generated, size:', pdfBuffer.length, 'bytes');

    // Step 5: Upload to Storage
    console.log('Step 5: Uploading PDF to Supabase Storage...');
    const bucketName = 'invoice-pdfs';
    const filePath = `public/${invoice.agency_id}/${invoice.id}-${uuidv4()}.pdf`;
    
    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Available buckets:', buckets?.map(b => b.name));
      const bucketExists = buckets?.some(b => b.name === bucketName);
      if (!bucketExists) {
        console.warn(`Bucket '${bucketName}' does not exist. Available buckets:`, buckets?.map(b => b.name));
      }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfBuffer as any, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('✗ Error uploading PDF:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload PDF: ${uploadError.message}` },
        { status: 500 }
      );
    }
    console.log('✓ PDF uploaded to:', filePath);

    // Step 6: Get public URL
    console.log('Step 6: Getting public URL...');
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const pdfUrl = publicUrlData.publicUrl;
    console.log('✓ Public URL:', pdfUrl);

    // Step 7: Update invoice record
    console.log('Step 7: Updating invoice record with PDF URL...');
    const { data: updateData, error: updateError } = await supabase
      .from('invoices')
      .update({ pdf_url: pdfUrl })
      .eq('id', invoiceId);

    if (updateError) {
      console.error('✗ Error updating invoice with PDF URL:', updateError);
      return NextResponse.json(
        { error: `Failed to save PDF URL to invoice: ${updateError.message}` },
        { status: 500 }
      );
    }
    console.log('✓ Invoice updated with PDF URL');

    // Step 8: Return success
    console.log('✓ PDF generation completed successfully');
    return NextResponse.json({ pdfUrl });

  } catch (error: any) {
    console.error('✗ An error occurred during PDF generation:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
} 
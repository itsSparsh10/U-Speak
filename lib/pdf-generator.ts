import jsPDF from 'jspdf';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  taxRate: number;
}

export function generateInvoicePDF(
  invoiceData: InvoiceData,
  subtotal: number,
  tax: number,
  total: number
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Colors
  const primaryColor = '#334155'; // slate-700
  const secondaryColor = '#64748b'; // slate-500
  const lightGray = '#f1f5f9'; // slate-100

  // Header
  pdf.setFillColor(51, 65, 85); // slate-700
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Company Logo/Name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payout', 20, 25);
  
  // Invoice Title
  pdf.setFontSize(16);
  pdf.text('INVOICE', pageWidth - 60, 25);

  // Reset text color
  pdf.setTextColor(0, 0, 0);

  // Company Information
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Payout Inc.', 20, 55);
  pdf.text('123 Business Street', 20, 62);
  pdf.text('New York, NY 10001', 20, 69);
  pdf.text('contact@payout.com', 20, 76);
  pdf.text('(555) 123-4567', 20, 83);

  // Invoice Details
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Number:', pageWidth - 100, 55);
  pdf.text('Issue Date:', pageWidth - 100, 62);
  pdf.text('Due Date:', pageWidth - 100, 69);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoiceData.invoiceNumber, pageWidth - 60, 55);
  pdf.text(new Date(invoiceData.issueDate).toLocaleDateString(), pageWidth - 60, 62);
  pdf.text(new Date(invoiceData.dueDate).toLocaleDateString(), pageWidth - 60, 69);

  // Bill To Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Bill To:', 20, 105);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(invoiceData.clientName, 20, 115);
  pdf.text(invoiceData.clientEmail, 20, 122);
  
  // Split address into lines
  const addressLines = invoiceData.clientAddress.split('\n');
  let yPos = 129;
  addressLines.forEach(line => {
    pdf.text(line, 20, yPos);
    yPos += 7;
  });

  // Items Table
  const tableStartY = 160;
  let currentY = tableStartY;

  // Table Header
  pdf.setFillColor(241, 245, 249); // slate-100
  pdf.rect(20, currentY - 5, pageWidth - 40, 15, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Description', 25, currentY + 5);
  pdf.text('Qty', pageWidth - 120, currentY + 5);
  pdf.text('Rate', pageWidth - 90, currentY + 5);
  pdf.text('Amount', pageWidth - 50, currentY + 5);

  currentY += 20;

  // Table Items
  pdf.setFont('helvetica', 'normal');
  invoiceData.items.forEach((item) => {
    pdf.text(item.description, 25, currentY);
    pdf.text(item.quantity.toString(), pageWidth - 120, currentY);
    pdf.text(`$${item.rate.toFixed(2)}`, pageWidth - 90, currentY);
    pdf.text(`$${item.amount.toFixed(2)}`, pageWidth - 50, currentY);
    currentY += 12;
  });

  // Totals Section
  currentY += 10;
  const totalsX = pageWidth - 100;

  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', totalsX - 30, currentY);
  pdf.text(`$${subtotal.toFixed(2)}`, totalsX + 10, currentY);

  currentY += 10;
  pdf.text(`Tax (${invoiceData.taxRate}%):`, totalsX - 30, currentY);
  pdf.text(`$${tax.toFixed(2)}`, totalsX + 10, currentY);

  currentY += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Total:', totalsX - 30, currentY);
  pdf.text(`$${total.toFixed(2)}`, totalsX + 10, currentY);

  // Notes Section
  if (invoiceData.notes) {
    currentY += 30;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Notes:', 20, currentY);
    
    currentY += 10;
    pdf.setFont('helvetica', 'normal');
    const noteLines = pdf.splitTextToSize(invoiceData.notes, pageWidth - 40);
    pdf.text(noteLines, 20, currentY);
    currentY += noteLines.length * 5;
  }

  // Terms Section
  if (invoiceData.terms) {
    currentY += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Terms & Conditions:', 20, currentY);
    
    currentY += 10;
    pdf.setFont('helvetica', 'normal');
    const termLines = pdf.splitTextToSize(invoiceData.terms, pageWidth - 40);
    pdf.text(termLines, 20, currentY);
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });

  // Save the PDF
  pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
}
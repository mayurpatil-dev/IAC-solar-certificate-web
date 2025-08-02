import jsPDF from 'jspdf';
import { join } from 'path';
import { readFileSync } from 'fs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const date = searchParams.get('date');

    if (!name) {
      return new Response('Name parameter is required', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain',
        }
      });
    }

    // Keep original name for display
    const originalName = name.trim();
    const cleanName = originalName.replace(/[^\w\s]/g, ''); // Remove special characters except spaces
    if (!cleanName) {
      return new Response('Invalid name provided', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain',
        }
      });
    }

    // Create PDF certificate
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Set background color (light blue)
    pdf.setFillColor(240, 248, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Add header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('IAC Nashik', pageWidth / 2, 40, { align: 'center' });

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('908 KWp Solar Power Plant Inauguration', pageWidth / 2, 60, { align: 'center' });

    // Add subtitle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Renewable Energy Development Program', pageWidth / 2, 80, { align: 'center' });

    // Add certificate text
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('This is to certify that', pageWidth / 2, 120, { align: 'center' });

    // Add employee name (centered and prominent)
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(originalName, pageWidth / 2, 150, { align: 'center' });

    // Add participation text
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text('has actively participated in the Renewable Energy Development Program', pageWidth / 2, 170, { align: 'center' });
    pdf.text('demonstrating commitment and awareness toward sustainable energy solutions', pageWidth / 2, 185, { align: 'center' });
    pdf.text('and contributing to a cleaner, greener future.', pageWidth / 2, 200, { align: 'center' });

    // Add date
    const displayDate = date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${displayDate}`, 30, pageHeight - 40);

    // Add signature line
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Authorized Signature', pageWidth - 80, pageHeight - 40);

    // Add footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('IAC - Nashik Plant 2025', pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: 'helvetica',
      date: displayDate
    });

    // Convert to buffer
    const buffer = pdf.output('arraybuffer');

    // Return the PDF as a downloadable file
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${cleanName.replace(/\s+/g, '_')}.pdf"`,
        'Cache-Control': 'no-cache',
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    console.error('Error details:', {
      name: name,
      date: date,
      errorMessage: error.message,
      stack: error.stack
    });
    return new Response('Error generating certificate', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
      }
    });
  }
} 
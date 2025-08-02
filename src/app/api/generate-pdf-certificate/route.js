import { PDFDocument, rgb } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeName } = body;

    if (!employeeName || typeof employeeName !== 'string' || employeeName.trim() === '') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Employee name is required and must be a non-empty string',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanName = employeeName.trim();

    // Load the certificate template image (PNG)
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    const templateImageBytes = readFileSync(templatePath);

    // Load the OpenSans font
    const fontPath = join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf');
    const fontBytes = readFileSync(fontPath);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed the PNG image
    const pngImage = await pdfDoc.embedPng(templateImageBytes);

    // Embed the OpenSans font
    const font = await pdfDoc.embedFont(fontBytes);

    // Add a page with the same size as the image
    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);

    // Draw the certificate template image on the page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height,
    });

    // Define text properties
    const fontSize = 48;
    const textWidth = font.widthOfTextAtSize(cleanName, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Calculate position to center the name horizontally and place vertically
    const x = (pngImage.width - textWidth) / 2;
    const y = pngImage.height * 0.45;

    // Draw the employee name on the certificate
    page.drawText(cleanName, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.17, 0.24, 0.31), // dark blue color
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF as base64 string
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    return new Response(JSON.stringify({
      success: true,
      pdfBase64: base64Pdf,
      fileName: `Solar_Certificate_${cleanName.replace(/\s+/g, '_')}.pdf`,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating PDF certificate:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error generating PDF certificate: ' + error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  }
}

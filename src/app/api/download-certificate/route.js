import puppeteer from 'puppeteer';
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

    // Create HTML certificate with multiple font fallbacks
    const displayDate = date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Solar Certificate</title>
        <style>
          /* Import Google Fonts for guaranteed availability */
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
          
          body {
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            width: 100%;
          }
          .header {
            color: #2c3e50;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 10px;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 40px;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .certificate-text {
            font-size: 16px;
            color: #34495e;
            margin-bottom: 30px;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .employee-name {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0;
            padding: 20px;
            border: 3px solid #3498db;
            border-radius: 10px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .participation-text {
            font-size: 16px;
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 30px;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
          }
          .date {
            font-size: 14px;
            color: #7f8c8d;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
          .signature {
            font-size: 14px;
            color: #7f8c8d;
            font-family: 'Roboto', 'Open Sans', 'Arial', 'Helvetica', 'sans-serif';
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="company-name">IAC Nashik</div>
            <div class="title">908 KWp Solar Power Plant Inauguration</div>
            <div class="subtitle">Renewable Energy Development Program</div>
          </div>
          
          <div class="certificate-text">This is to certify that</div>
          
          <div class="employee-name">${originalName}</div>
          
          <div class="participation-text">
            has actively participated in the Renewable Energy Development Program, 
            demonstrating commitment and awareness toward sustainable energy solutions 
            and contributing to a cleaner, greener future.
          </div>
          
          <div class="footer">
            <div class="date">Date: ${displayDate}</div>
            <div class="signature">Authorized Signature</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Launch browser and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-gpu-sandbox'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent for better font rendering
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Enable JavaScript and wait for fonts to load
    await page.setContent(htmlContent);
    await page.waitForTimeout(2000); // Wait longer for Google Fonts to load
    
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: 'Roboto + Open Sans + Arial + Helvetica fallbacks',
      date: displayDate
    });

    // Return the PDF as a downloadable file
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${cleanName.replace(/\s+/g, '_')}.pdf"`,
        'Cache-Control': 'no-cache',
        'Content-Length': pdf.length.toString(),
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
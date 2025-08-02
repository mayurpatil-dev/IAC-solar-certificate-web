import puppeteer from 'puppeteer';

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

    // Create simple HTML certificate
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
        <title>Solar Certificate - ${originalName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, Helvetica, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
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
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #34495e;
            margin-bottom: 10px;
          }
          
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          
          .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          
          .certificate-text {
            font-size: 16px;
            color: #34495e;
            margin-bottom: 30px;
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
          }
          
          .participation-text {
            font-size: 16px;
            color: #34495e;
            line-height: 1.6;
            margin-bottom: 30px;
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
          }
          
          .signature {
            font-size: 14px;
            color: #7f8c8d;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          
          @media print {
            .print-button {
              display: none;
            }
            body {
              background: white;
            }
            .certificate {
              box-shadow: none;
              border: 2px solid #000;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">Print Certificate</button>
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
        
        <script>
          // Auto-print after 1 second
          setTimeout(() => {
            window.print();
          }, 1000);
        </script>
      </body>
      </html>
    `;

    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: 'Arial, Helvetica, sans-serif',
      date: displayDate
    });

    // Return the HTML directly
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
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
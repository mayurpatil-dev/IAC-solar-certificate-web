import sharp from 'sharp';
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

    // Load the certificate template
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    
    let templateBuffer;
    try {
      templateBuffer = readFileSync(templatePath);
    } catch (error) {
      console.error('Error loading template:', error);
      return new Response('Certificate template not found', { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain',
        }
      });
    }

    // Create SVG text overlay
    const svgText = `
      <svg width="1400" height="900" xmlns="http://www.w3.org/2000/svg">
        <text x="700" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="black">${originalName}</text>
        <text x="50" y="850" font-family="Arial, sans-serif" font-size="16" fill="#495057">Date: ${date || new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"})}</text>
      </svg>
    `;

    // Combine template with text overlay
    const buffer = await sharp(templateBuffer)
      .composite([{
        input: Buffer.from(svgText),
        top: 0,
        left: 0
      }])
      .png()
      .toBuffer();

    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: 'Arial, sans-serif',
      date: date || new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    });

    // Return the image as a downloadable file with optimized headers
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${cleanName.replace(/\s+/g, '_')}.png"`,
        'Cache-Control': 'no-cache',
        'Content-Length': buffer.length.toString(),
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
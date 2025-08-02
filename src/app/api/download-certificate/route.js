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
    
    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      name,
      date,
      url: request.url
    });

    // Load the certificate template
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    const templateBuffer = readFileSync(templatePath);
    
    // Get template dimensions
    const templateMetadata = await sharp(templateBuffer).metadata();
    const { width, height } = templateMetadata;
    
    // Create transparent PNG with name text
    const nameSvg = `
      <svg width="800" height="100" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="400" 
          y="60" 
          font-family="Arial, sans-serif" 
          font-size="48" 
          font-weight="bold" 
          text-anchor="middle" 
          dominant-baseline="middle"
          fill="#2c3e50"
          stroke="#ffffff"
          stroke-width="2"
        >${originalName}</text>
      </svg>
    `;
    
    // Generate transparent PNG with name
    const nameBuffer = await sharp(Buffer.from(nameSvg))
      .png()
      .toBuffer();
    
    // Create transparent PNG with date text
    const displayDate = date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const dateSvg = `
      <svg width="400" height="50" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="10" 
          y="30" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          fill="#7f8c8d"
        >Date: ${displayDate}</text>
      </svg>
    `;
    
    // Generate transparent PNG with date
    const dateBuffer = await sharp(Buffer.from(dateSvg))
      .png()
      .toBuffer();
    
    // Calculate positions for compositing
    const nameX = Math.floor((width - 800) / 2); // Center the name
    const nameY = Math.floor((height - 100) / 2); // Center vertically
    const dateX = 50; // Left side
    const dateY = height - 100; // Bottom area
    
    // Composite the template with text overlays
    const result = await sharp(templateBuffer)
      .composite([
        { input: nameBuffer, top: nameY, left: nameX },
        { input: dateBuffer, top: dateY, left: dateX }
      ])
      .png()
      .toBuffer();
    
    // Debug logging
    console.log('Certificate generation completed:', {
      originalName,
      width,
      height,
      namePosition: { x: nameX, y: nameY },
      datePosition: { x: dateX, y: dateY }
    });

    // Return the image as a downloadable file
    return new Response(result, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${originalName.replace(/\s+/g, '_')}.png"`,
        'Cache-Control': 'no-cache',
        'Content-Length': result.length.toString(),
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
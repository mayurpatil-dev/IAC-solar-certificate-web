import { createCanvas } from 'canvas';
import { join } from 'path';
import { writeFileSync } from 'fs';

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

    // Create transparent PNG with name text only
    const nameCanvas = createCanvas(800, 100);
    const nameCtx = nameCanvas.getContext('2d');
    
    // Make background completely transparent
    nameCtx.clearRect(0, 0, 800, 100);
    
    // Set text properties for name
    nameCtx.font = 'bold 48px Arial';
    nameCtx.fillStyle = '#2c3e50';
    nameCtx.textAlign = 'center';
    nameCtx.textBaseline = 'middle';
    
    // Add white stroke for visibility on any background
    nameCtx.strokeStyle = '#ffffff';
    nameCtx.lineWidth = 3;
    nameCtx.strokeText(originalName, 400, 50);
    
    // Draw the text
    nameCtx.fillText(originalName, 400, 50);
    
    // Convert name to PNG buffer
    const nameBuffer = nameCanvas.toBuffer('image/png');
    
    // Save the name PNG to public folder
    const safeFileName = originalName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const namePngPath = join(process.cwd(), 'public', `name_${safeFileName}.png`);
    writeFileSync(namePngPath, nameBuffer);
    
    // Create date PNG if provided
    if (date) {
      const displayDate = date;
      
      // Create transparent PNG for date
      const dateCanvas = createCanvas(400, 50);
      const dateCtx = dateCanvas.getContext('2d');
      
      // Make background transparent
      dateCtx.clearRect(0, 0, 400, 50);
      
      // Set text properties for date
      dateCtx.font = '16px Arial';
      dateCtx.fillStyle = '#7f8c8d';
      dateCtx.textAlign = 'left';
      dateCtx.textBaseline = 'top';
      
      // Draw the date
      dateCtx.fillText(`Date: ${displayDate}`, 10, 10);
      
      // Convert date to buffer and save
      const dateBuffer = dateCanvas.toBuffer('image/png');
      const datePngPath = join(process.cwd(), 'public', `date_${safeFileName}.png`);
      writeFileSync(datePngPath, dateBuffer);
    }
    
    // Debug logging
    console.log('PNG files created:', {
      originalName,
      namePngPath,
      datePngPath: date ? join(process.cwd(), 'public', `date_${safeFileName}.png`) : null,
      nameBufferSize: nameBuffer.length
    });

    // Return success message with file paths
    return new Response(JSON.stringify({
      success: true,
      message: 'Name PNG created successfully',
      files: {
        namePng: `/name_${safeFileName}.png`,
        datePng: date ? `/date_${safeFileName}.png` : null,
        originalName: originalName
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating name PNG:', error);
    console.error('Error details:', {
      name: name,
      date: date,
      errorMessage: error.message,
      stack: error.stack
    });
    return new Response('Error generating name PNG', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
      }
    });
  }
} 
import { createCanvas } from 'canvas';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

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
    console.log('Name PNG generation debug:', {
      originalName,
      name,
      url: request.url
    });

    // Create canvas for text
    const canvas = createCanvas(800, 100);
    const ctx = canvas.getContext('2d');
    
    // Make background transparent
    ctx.clearRect(0, 0, 800, 100);
    
    // Set text properties
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add white stroke for visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeText(originalName, 400, 50);
    
    // Draw the text
    ctx.fillText(originalName, 400, 50);
    
    // Convert to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    
    // Debug logging
    console.log('PNG generated successfully:', {
      originalName,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      bufferSize: pngBuffer.length
    });

    // Return the PNG as a downloadable file
    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="name-${originalName.replace(/\s+/g, '-').toLowerCase()}.png"`,
        'Cache-Control': 'no-cache',
        'Content-Length': pngBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating name PNG:', error);
    console.error('Error details:', {
      name: name,
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
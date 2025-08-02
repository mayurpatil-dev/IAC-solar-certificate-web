import { createCanvas, loadImage } from 'canvas';
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

    // Step 1: Create transparent PNG with name text only
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
    
    // Convert name to transparent PNG buffer
    const nameBuffer = nameCanvas.toBuffer('image/png');
    
    // Step 2: Load the certificate template
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    const templateImage = await loadImage(templatePath);
    
    // Step 3: Create final canvas with template dimensions
    const finalCanvas = createCanvas(templateImage.width, templateImage.height);
    const finalCtx = finalCanvas.getContext('2d');
    
    // Step 4: Draw the template first
    finalCtx.drawImage(templateImage, 0, 0);
    
    // Step 5: Load the name image and composite it
    const nameImage = await loadImage(nameBuffer);
    
    // Calculate position to center the name on the certificate
    const nameX = Math.floor((templateImage.width - 800) / 2);
    const nameY = Math.floor((templateImage.height - 100) / 2);
    
    // Composite the name onto the template
    finalCtx.drawImage(nameImage, nameX, nameY);
    
    // Step 6: Add date if provided
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
      
      // Convert date to buffer and composite
      const dateBuffer = dateCanvas.toBuffer('image/png');
      const dateImage = await loadImage(dateBuffer);
      
      // Position date at bottom
      finalCtx.drawImage(dateImage, 50, templateImage.height - 100);
    }
    
    // Step 7: Convert final result to buffer
    const result = finalCanvas.toBuffer('image/png');
    
    // Debug logging
    console.log('Certificate generation completed:', {
      originalName,
      templateWidth: templateImage.width,
      templateHeight: templateImage.height,
      namePosition: { x: nameX, y: nameY },
      nameImageSize: { width: nameImage.width, height: nameImage.height }
    });

    // Return the final certificate image
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
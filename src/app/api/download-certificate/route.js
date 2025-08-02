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

    // Clean and validate the name - keep original name for display
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

    // Create canvas with certificate dimensions
    const canvas = createCanvas(1400, 900);
    const ctx = canvas.getContext('2d');

    // Load the certificate template with error handling
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    
    let templateImage;
    try {
      templateImage = await loadImage(templatePath);
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

    // Draw the template as background
    ctx.drawImage(templateImage, 0, 0, 1400, 900);

    // Use the most basic font specification that works on Vercel
    ctx.font = 'bold 60px sans-serif';
    ctx.fillStyle = '#000000'; // Black color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add stronger shadow for better visibility
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Handle long names by adjusting font size
    let fontSize = 60;
    
    // Measure text width and adjust font size if needed
    let textWidth = ctx.measureText(originalName).width;
    
    // If text is too wide, reduce font size
    while (textWidth > 800 && fontSize > 30) {
      fontSize -= 5;
      ctx.font = `bold ${fontSize}px sans-serif`;
      textWidth = ctx.measureText(originalName).width;
    }
    
    // Position the name in the center area - use original name for display
    ctx.fillText(originalName, 700, 480);

    // Add date at bottom left with better font
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#495057';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.textAlign = 'left';
    
    // Ensure date is properly formatted
    const displayDate = date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    ctx.fillText(`Date: ${displayDate}`, 50, 850);

    // Convert canvas to buffer with optimized settings
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 6,
      filters: canvas.PNG_FILTER_NONE
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
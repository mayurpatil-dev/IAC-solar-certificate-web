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

    // Use a very basic font specification that will work on Vercel
    ctx.font = 'bold 60px monospace';
    ctx.fillStyle = '#000000'; // Black color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add stronger shadow for better visibility
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Position the name lower in the center area
    ctx.fillText(name, 700, 480);

    // Add date at bottom left
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#495057';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${date}`, 50, 850);

    // Convert canvas to buffer with optimized settings
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 6,
      filters: canvas.PNG_FILTER_NONE
    });

    // Return the image as a downloadable file with optimized headers
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${name.replace(/\s+/g, '_')}.png"`,
        'Cache-Control': 'no-cache',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return new Response('Error generating certificate', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
      }
    });
  }
} 
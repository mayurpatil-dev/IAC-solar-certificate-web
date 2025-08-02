import { createCanvas, loadImage, registerFont } from 'canvas';
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

    // Try to use a more elegant font, with fallbacks
    let fontLoaded = false;
    const fontOptions = [
      'bold 56px "Times New Roman", serif',
      'bold 56px Georgia, serif',
      'bold 56px Arial, sans-serif',
      '56px Arial, sans-serif'
    ];

    // Try each font option
    for (const fontOption of fontOptions) {
      try {
        ctx.font = fontOption;
        // Test if font works by measuring text
        const testText = ctx.measureText(name);
        if (testText.width > 0) {
          fontLoaded = true;
          break;
        }
      } catch (error) {
        console.log(`Font ${fontOption} failed, trying next...`);
        continue;
      }
    }

    // If no font worked, use the most basic option
    if (!fontLoaded) {
      ctx.font = '56px Arial';
    }

    ctx.fillStyle = '#000000'; // Black color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Position the name lower in the center area
    ctx.fillText(name, 700, 480);

    // Add date at bottom left with optimized rendering
    ctx.font = '16px Arial, sans-serif';
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
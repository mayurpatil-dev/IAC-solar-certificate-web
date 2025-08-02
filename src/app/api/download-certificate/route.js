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

    // Try multiple basic fonts to ensure compatibility
    const basicFonts = ['Arial', 'Helvetica', 'sans-serif', 'monospace'];
    let fontSize = 48;
    let textWidth = 0;
    let fontIndex = 0;
    
    // Try different fonts until we get a valid text width
    do {
      ctx.font = `${fontSize}px ${basicFonts[fontIndex]}`;
      textWidth = ctx.measureText(originalName).width;
      
      // If text width is too small, try next font
      if (textWidth < 10) {
        fontIndex = (fontIndex + 1) % basicFonts.length;
        if (fontIndex === 0) {
          fontSize -= 8;
          if (fontSize < 12) break;
        }
      }
    } while (textWidth < 10 && fontSize >= 12);
    
    // Set final font
    ctx.font = `${fontSize}px ${basicFonts[fontIndex]}`;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // No shadow effects to avoid any rendering issues
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // If text is still too wide, reduce font size further
    while (textWidth > 600 && fontSize > 12) {
      fontSize -= 4;
      ctx.font = `${fontSize}px ${basicFonts[fontIndex]}`;
      textWidth = ctx.measureText(originalName).width;
    }
    
    // Position the name in the center area
    ctx.fillText(originalName, 700, 480);
    
    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: `${fontSize}px ${basicFonts[fontIndex]}`,
      textWidth,
      date: date || new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    });

    // Add date at bottom left with simple font
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#495057';
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
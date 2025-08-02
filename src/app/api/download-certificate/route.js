import Jimp from 'jimp';
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
    
    let templateImage;
    try {
      templateImage = await Jimp.read(templatePath);
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

    // Load fonts for text rendering
    let nameFont, dateFont;
    try {
      nameFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      dateFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Use smaller fonts as fallback
      nameFont = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      dateFont = await Jimp.loadFont(Jimp.FONT_SANS_8_BLACK);
    }

    // Calculate center position for name
    const imageWidth = templateImage.getWidth();
    const imageHeight = templateImage.getHeight();
    const nameX = Math.floor(imageWidth / 2);
    const nameY = Math.floor(imageHeight / 2);

    // Add the name to the certificate at center
    templateImage.print(nameFont, nameX - 100, nameY - 20, originalName);

    // Add date at bottom left
    const displayDate = date || new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    templateImage.print(dateFont, 50, 850, `Date: ${displayDate}`);

    // Debug logging
    console.log('Certificate generation debug:', {
      originalName,
      cleanName,
      fontUsed: 'Jimp.FONT_SANS_32_BLACK',
      date: displayDate,
      imageWidth,
      imageHeight,
      nameX,
      nameY
    });

    // Convert to buffer
    const buffer = await templateImage.getBufferAsync(Jimp.MIME_PNG);

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
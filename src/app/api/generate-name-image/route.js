import { createCanvas, registerFont } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const fontPath = join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf');
registerFont(fontPath, { family: 'Open Sans' });

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new Response('Name is required', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });
    }

    // Clean the name
    const cleanName = name.trim();
    
    // Create a larger canvas for better quality
    const canvas = createCanvas(1600, 200);
    const ctx = canvas.getContext('2d');
    
    // Make background transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Measure text to determine optimal font size
    let fontSize = 80;
    ctx.font = `bold ${fontSize}px "Open Sans"`;
    
    // Adjust font size to fit within canvas
    const maxWidth = canvas.width * 0.9;
    const textWidth = ctx.measureText(cleanName).width;
    
    if (textWidth > maxWidth) {
      fontSize = Math.floor((maxWidth / textWidth) * fontSize);
      ctx.font = `bold ${fontSize}px "Open Sans"`;
    }
    
    // Set text properties
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add white stroke for better visibility
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeText(cleanName, canvas.width / 2, canvas.height / 2);
    
    // Draw the text
    ctx.fillText(cleanName, canvas.width / 2, canvas.height / 2);
    
    // Convert to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');

    // Save the generated image temporarily for inspection
    const tempPath = join(process.cwd(), 'public', 'debug_name_image.png');
    writeFileSync(tempPath, pngBuffer);
    console.log('Saved debug name image to:', tempPath);
    
    // Return the PNG as base64 for easy handling
    const base64Image = pngBuffer.toString('base64');
    
    return new Response(JSON.stringify({
      success: true,
      nameImage: base64Image,
      width: canvas.width,
      height: canvas.height
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating name image:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error generating name image: ' + error.message
    }), { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      }
    });
  }
}

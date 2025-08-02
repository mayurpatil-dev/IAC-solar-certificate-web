import { createCanvas, loadImage } from 'canvas';
import { join } from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nameImageBase64, employeeName } = body;

    if (!nameImageBase64 || !employeeName) {
      return new Response('Name image and employee name are required', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });
    }

    // Load the certificate template
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    const templateImage = await loadImage(templatePath);
    
    // Load the name image from base64
    const nameImageData = Buffer.from(nameImageBase64, 'base64');
    const nameImage = await loadImage(nameImageData);
    
    // Create final canvas with template dimensions
    const finalCanvas = createCanvas(templateImage.width, templateImage.height);
    const finalCtx = finalCanvas.getContext('2d');
    
    // Draw the template first
    finalCtx.drawImage(templateImage, 0, 0);
    
    // Calculate position to place the name on the certificate
    // Positioning for typical certificate layout (centered horizontally, positioned vertically)
    const nameX = Math.floor((templateImage.width - nameImage.width) / 2);
    
    // Adjust vertical position to place name in a typical certificate name area
    // This positions the name in the upper third of the certificate
    const nameY = Math.floor(templateImage.height * 0.45 - nameImage.height / 2);
    
    // Composite the name onto the template
    finalCtx.drawImage(nameImage, nameX, nameY);
    
    // Convert final result to buffer
    const result = finalCanvas.toBuffer('image/png');
    
    // Return the final certificate image as base64
    const base64Certificate = result.toString('base64');
    
    return new Response(JSON.stringify({
      success: true,
      certificateImage: base64Certificate,
      fileName: `Solar_Certificate_${employeeName.replace(/\s+/g, '_')}.png`
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error compositing certificate:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error compositing certificate: ' + error.message
    }), { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      }
    });
  }
}

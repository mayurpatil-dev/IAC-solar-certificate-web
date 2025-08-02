import { createCanvas, loadImage } from 'canvas';
import { join } from 'path';
import { readFileSync } from 'fs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { namePngPath, employeeName } = body;

    if (!namePngPath || !employeeName) {
      return new Response('Name PNG path and employee name are required', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain',
        }
      });
    }

    // Debug logging
    console.log('Certificate compositing debug:', {
      namePngPath,
      employeeName,
    });

    // Step 1: Load the certificate template
    const templatePath = join(process.cwd(), 'public', 'Final_Certificate_Temp.png');
    const templateImage = await loadImage(templatePath);
    
    // Step 2: Load the name PNG
    const namePngPathFull = join(process.cwd(), 'public', namePngPath.replace('/', ''));
    const nameImage = await loadImage(namePngPathFull);
    
    // Step 3: Create final canvas with template dimensions
    const finalCanvas = createCanvas(templateImage.width, templateImage.height);
    const finalCtx = finalCanvas.getContext('2d');
    
    // Step 4: Draw the template first
    finalCtx.drawImage(templateImage, 0, 0);
    
    // Step 5: Calculate position to center the name on the certificate
    // Based on the certificate layout, the name should go in the center area
    const nameX = Math.floor((templateImage.width - nameImage.width) / 2);
    const nameY = Math.floor((templateImage.height - nameImage.height) / 2);
    
    // Step 6: Composite the name onto the template
    finalCtx.drawImage(nameImage, nameX, nameY);
    
    // Step 7: Convert final result to buffer
    const result = finalCanvas.toBuffer('image/png');
    
    // Debug logging
    console.log('Certificate compositing completed:', {
      employeeName,
      templateWidth: templateImage.width,
      templateHeight: templateImage.height,
      nameImageWidth: nameImage.width,
      nameImageHeight: nameImage.height,
      namePosition: { x: nameX, y: nameY }
    });

    // Return the final certificate image
    return new Response(result, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Solar_Certificate_${employeeName.replace(/\s+/g, '_')}.png"`,
        'Cache-Control': 'no-cache',
        'Content-Length': result.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error compositing certificate:', error);
    console.error('Error details:', {
      namePngPath: body?.namePngPath,
      employeeName: body?.employeeName,
      errorMessage: error.message,
      stack: error.stack
    });
    return new Response('Error compositing certificate', { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
      }
    });
  }
} 
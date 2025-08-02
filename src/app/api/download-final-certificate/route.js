export async function POST(request) {
  try {
    const body = await request.json();
    const { certificateImageBase64, fileName } = body;

    if (!certificateImageBase64 || !fileName) {
      return new Response('Certificate image and file name are required', { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'text/plain',
        }
      });
    }

    // Convert base64 to buffer
    const certificateBuffer = Buffer.from(certificateImageBase64, 'base64');
    
    // Return the certificate as a downloadable file
    return new Response(certificateBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
        'Content-Length': certificateBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading certificate:', error);
    return new Response('Error downloading certificate: ' + error.message, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
      }
    });
  }
}

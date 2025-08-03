import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { name } = await req.json();

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load the background certificate image
    const bgPath = path.join(process.cwd(), 'public/Final_certificate_template.png');
    const bgBytes = fs.readFileSync(bgPath);
    const bgImage = await pdfDoc.embedPng(bgBytes);

    const page = pdfDoc.addPage([1194, 768]);
    const { width } = page.getSize();

    page.drawImage(bgImage, {
      x: 0,
      y: 0,
      width: 1194,
      height: 768,
    });

    // Load and use the correct font
    const fontPath = path.join(process.cwd(), 'public/fonts/NotoSans-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const unicodeFont = await pdfDoc.embedFont(fontBytes);

    // Adjust text size if name is long
    const fontSize = name.length > 20 ? 26 : 32;
    const textWidth = unicodeFont.widthOfTextAtSize(name, fontSize);
    const xPosition = (width - textWidth) / 2;

    // Draw the name in the center
    page.drawText(name, {
      x: xPosition,
      y: 390,
      size: fontSize,
      font: unicodeFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=certificate.pdf',
      },
    });

  } catch (err) {
    console.error('PDF Generation Error:', err);
    return new Response('Failed to generate PDF', { status: 500 });
  }
}

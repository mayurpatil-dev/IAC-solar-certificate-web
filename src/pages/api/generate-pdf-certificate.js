export const runtime = 'node';

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Load the background certificate image
    const bgPath = path.join(process.cwd(), 'public/Final_Certificate_Temp.png');
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=certificate.pdf');
    res.status(200).send(pdfBytes);

  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

import { createCanvas, loadImage, registerFont } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

function handler({ employeeName, agreed }) {
  // Input validation with early returns for better performance
  if (!employeeName || typeof employeeName !== "string") {
    return {
      error: "Employee name is required and must be a valid string",
      success: false,
    };
  }

  const trimmedName = employeeName.trim();
  if (trimmedName.length === 0) {
    return {
      error: "Employee name cannot be empty",
      success: false,
    };
  }

  if (agreed !== true) {
    return {
      error: "Agreement to participate is required",
      success: false,
    };
  }

  // Optimize date formatting
  const now = new Date();
  const generatedAt = now.toISOString();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Optimize filename generation
  const safeFileName = trimmedName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');

  return {
    success: true,
    message: "Certificate generated successfully",
    certificate: {
      employeeName: trimmedName,
      program: "Solar Plant Inauguration - Renewable Energy Development Program",
      organization: "IAC Nashik",
      generatedAt: generatedAt,
      participationConfirmed: true,
      downloadUrl: `/api/download-certificate?name=${encodeURIComponent(trimmedName)}&date=${encodeURIComponent(formattedDate)}`,
      fileName: `Solar_Certificate_${safeFileName}.png`,
    },
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = handler(body);
    
    // Return appropriate response based on result
    if (result.success) {
      return Response.json(result, {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });
    } else {
      return Response.json(result, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      });
    }
  } catch (error) {
    console.error('Certificate generation error:', error);
    return Response.json(
      { 
        error: "Internal server error", 
        success: false,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 
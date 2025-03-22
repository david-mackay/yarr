import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAbsoluteFilePath } from '@/lib/mediaLib';
import { getMimeType } from '@/lib/utils';

// API endpoint for streaming media files
export async function GET(
  request: NextRequest,
  { params }: { params: { mediaType: string; slug: string[] } }
) {
  try {
    const { mediaType, slug } = params;
    
    // Construct the relative path
    const relativePath = `/${mediaType}/${slug.join('/')}`;
    const filePath = getAbsoluteFilePath(relativePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const mimeType = getMimeType(filePath);
    
    // Parse range header for streaming support
    const rangeHeader = request.headers.get('range');
    
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      
      // Create read stream for the specified range
      const fileStream = fs.createReadStream(filePath, { start, end });
      
      // Create response with appropriate headers for range request
      const response = new NextResponse(fileStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
        },
      });
      
      return response;
    } else {
      // Create read stream for the entire file
      const fileStream = fs.createReadStream(filePath);
      
      // Create response with appropriate headers for full file
      const response = new NextResponse(fileStream as any, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
        },
      });
      
      return response;
    }
  } catch (error) {
    console.error('Error streaming media:', error);
    return NextResponse.json(
      { error: 'Failed to stream media' },
      { status: 500 }
    );
  }
}
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
    // In Next.js App Router, params are now returned as a Promise
    // Ensure we await them before use
    const resolvedParams = await Promise.resolve(params);
    const mediaType = resolvedParams.mediaType;
    const slug = resolvedParams.slug;
    
    // Construct the relative path
    const relativePath = `/${mediaType}/${slug.join('/')}`;
    const filePath = await getAbsoluteFilePath(relativePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
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
    
    // Common headers for all responses
    const commonHeaders = {
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*', // Add CORS header
      'Cache-Control': 'no-cache', // Important for streaming
      'X-Content-Type-Options': 'nosniff', // Security header
    };
    
    // iOS devices often need these specific headers for audio in MP4
    if (mimeType.includes('mp4') || mimeType.includes('audio')) {
      Object.assign(commonHeaders, {
        'Content-Disposition': 'inline', // Force browser to play the content
      });
    }
    
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
          ...commonHeaders,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunkSize.toString(),
        },
      });
      
      return response;
    } else {
      // For iOS devices, it's often better to force partial content delivery
      // even when no range is requested
      const start = 0;
      const end = Math.min(fileSize - 1, 1024 * 1024); // First 1MB for initial playback
      const chunkSize = end - start + 1;
      
      // Create read stream for the specified range
      const fileStream = fs.createReadStream(filePath, { start, end });
      
      // Create response with appropriate headers
      const response = new NextResponse(fileStream as any, {
        status: 206, // Use 206 Partial Content even for initial request
        headers: {
          ...commonHeaders,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunkSize.toString(),
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
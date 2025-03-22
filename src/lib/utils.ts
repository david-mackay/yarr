import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { getAbsoluteFilePath } from './mediaLib';

const execPromise = util.promisify(exec);

// Conversion cache directory
const CONVERSION_CACHE_DIR = path.join(process.cwd(), '.conversions');

// Thumbnail cache directory
const THUMBNAIL_CACHE_DIR = path.join(process.cwd(), '.thumbnails');

// Ensure thumbnail cache directory exists
export function ensureThumbnailDir() {
  if (!fs.existsSync(THUMBNAIL_CACHE_DIR)) {
    fs.mkdirSync(THUMBNAIL_CACHE_DIR, { recursive: true });
  }
}

// Ensure conversion cache directory exists
export function ensureConversionDir() {
  if (!fs.existsSync(CONVERSION_CACHE_DIR)) {
    fs.mkdirSync(CONVERSION_CACHE_DIR, { recursive: true });
  }
}

// Convert MKV to MP4 for better compatibility
export async function convertMkvToMp4(mediaPath: string): Promise<string | null> {
  // Only process MKV files
  if (!mediaPath.toLowerCase().endsWith('.mkv')) {
    return null;
  }
  
  ensureConversionDir();
  
  const absolutePath = getAbsoluteFilePath(mediaPath);
  const hash = Buffer.from(mediaPath).toString('base64').replace(/[/\\?%*:|"<>]/g, '-');
  const outputPath = path.join(CONVERSION_CACHE_DIR, `${hash}.mp4`);
  
  // Return cached conversion if it exists
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }
  
  try {
    // Convert MKV to MP4 using ffmpeg
    // This copies the video stream (no re-encoding) and converts audio to AAC
    await execPromise(`ffmpeg -y -i "${absolutePath}" -c:v copy -c:a aac "${outputPath}"`);
    return outputPath;
  } catch (error) {
    console.error('Error converting MKV to MP4:', error);
    return null;
  }
}

// Generate a thumbnail for a video file using ffmpeg
export async function generateThumbnail(mediaPath: string): Promise<string | null> {
  ensureThumbnailDir();
  
  const absolutePath = getAbsoluteFilePath(mediaPath);
  const hash = Buffer.from(mediaPath).toString('base64').replace(/[/\\?%*:|"<>]/g, '-');
  const thumbnailPath = path.join(THUMBNAIL_CACHE_DIR, `${hash}.jpg`);
  
  // Return cached thumbnail if it exists
  if (fs.existsSync(thumbnailPath)) {
    return thumbnailPath;
  }
  
  try {
    // Generate thumbnail using ffmpeg
    // This extracts a frame at 10% of the video duration
    await execPromise(`ffmpeg -y -i "${absolutePath}" -ss 00:00:10 -vframes 1 -vf "scale=320:-1" "${thumbnailPath}"`);
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get media file information
export async function getMediaInfo(filePath: string): Promise<any> {
  try {
    const { stdout } = await execPromise(`ffprobe -v error -show_format -show_streams -of json "${filePath}"`);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error getting media info:', error);
    return null;
  }
}

// Get mime type based on file extension
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.mp4':
      return 'video/mp4';
    case '.mkv':
      // Use a more generic MIME type for MKV to better handle audio
      return 'video/x-matroska';
    case '.avi':
      return 'video/x-msvideo';
    case '.mov':
      return 'video/quicktime';
    case '.webm':
      return 'video/webm';
    case '.m4v':
      return 'video/mp4';
    case '.ogg':
      return 'video/ogg';
    case '.ogv':
      return 'video/ogg';
    case '.mp3':
      return 'audio/mpeg';
    case '.aac':
      return 'audio/aac';
    case '.flac':
      return 'audio/flac';
    case '.wav':
      return 'audio/wav';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}
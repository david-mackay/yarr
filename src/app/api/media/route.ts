import { NextRequest, NextResponse } from 'next/server';
import { getAllMedia, getMediaByCategory } from '@/lib/mediaLib';

// API endpoint to get all media or media by category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    if (category) {
      const media = await getMediaByCategory(category);
      return NextResponse.json(media);
    } else {
      const allMedia = await getAllMedia();
      return NextResponse.json(allMedia);
    }
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
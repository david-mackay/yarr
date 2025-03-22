'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MediaPlayer from '@/app/components/MediaPlayer';

export default function PlayerPage() {
  const searchParams = useSearchParams();
  const path = searchParams.get('path');
  const title = searchParams.get('title') || 'Media Player';
  
  const [streamUrl, setStreamUrl] = useState<string>('');
  
  useEffect(() => {
    if (path) {
      // Make sure the path is properly URL-encoded for spaces and special characters
      // but preserve the forward slashes
      const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
      const streamUrl = `/api/media${encodedPath}`;
      setStreamUrl(streamUrl);
    }
  }, [path]);
  
  if (!path || !streamUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Invalid Media Path</h1>
          <p>No media file specified to play.</p>
        </div>
      </div>
    );
  }
  
  return <MediaPlayer src={streamUrl} title={title} />;
}
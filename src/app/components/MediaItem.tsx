'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/lib/types';

interface MediaItemProps {
  item: MediaItem;
}

export default function MediaItemComponent({ item }: MediaItemProps) {
  const [imageError, setImageError] = useState(false);
  
  // Generate thumbnail URL
  const thumbnailUrl = `/api/thumbnails${item.path}`;
  
  // Determine link URL based on media type
  const linkUrl = item.type === 'episode' 
    ? `/player?path=${encodeURIComponent(item.path)}`
    : item.type === 'tvshow' 
      ? `/${item.category}/${item.id}`
      : `/player?path=${encodeURIComponent(item.path)}`;
  
  return (
    <Link href={linkUrl}>
      <div className="bg-gray-800 rounded-lg overflow-hidden transition transform hover:scale-105 hover:shadow-lg">
        <div className="relative aspect-video">
          {!imageError ? (
            <Image
              src={thumbnailUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <span className="text-5xl text-gray-500">
                {item.type === 'movie' ? '🎬' : item.type === 'tvshow' ? '📺' : '🎞️'}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-white font-medium truncate">{item.title}</h3>
          <p className="text-gray-400 text-sm capitalize">{item.type}</p>
        </div>
      </div>
    </Link>
  );
}
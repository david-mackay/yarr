import { MediaItem } from '@/lib/types';
import MediaItemComponent from './MediaItem';

interface MediaGridProps {
  items: MediaItem[];
  title?: string;
}

export default function MediaGrid({ items, title }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-4 md:py-6">
        {title && <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-6">{title}</h2>}
        <div className="bg-gray-800 rounded-lg p-4 md:p-8 text-center">
          <p className="text-sm md:text-base text-gray-400">No media found in this category.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4 md:py-6">
      {title && <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-6">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {items.map(item => (
          <MediaItemComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
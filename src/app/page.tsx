import { Metadata } from 'next';
import { getAllMedia } from '@/lib/mediaLib';
import { MediaType } from '@/lib/types';
import MediaGrid from './components/MediaGrid';

export const metadata: Metadata = {
  title: 'Home | Media Stream',
  description: 'Stream your media files from anywhere on your network',
};

export default async function Home() {
  const allMedia = await getAllMedia();
  
  // Filter media by type
  const movies = allMedia.filter(item => item.type === 'movie');
  const tvShows = allMedia.filter(item => item.type === 'tvshow');
  
  // Group other media by category
  const customCategories = new Map<string, typeof allMedia>();
  
  allMedia.forEach(item => {
    if (item.type !== 'movie' && item.type !== 'tvshow' && item.type !== 'episode') {
      if (!customCategories.has(item.category)) {
        customCategories.set(item.category, []);
      }
      customCategories.get(item.category)?.push(item);
    }
  });
  
  return (
    <main className="px-4 py-6 w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Media Stream</h1>
        <p className="text-sm md:text-base text-gray-400 mt-1 md:mt-2">
          Stream your media files from anywhere on your local network
        </p>
      </div>
      
      {movies.length > 0 && (
        <MediaGrid items={movies} title="Recent Movies" />
      )}
      
      {tvShows.length > 0 && (
        <MediaGrid items={tvShows} title="TV Shows" />
      )}
      
      {Array.from(customCategories).map(([category, items]) => (
        <MediaGrid 
          key={category} 
          items={items} 
          title={category.charAt(0).toUpperCase() + category.slice(1)} 
        />
      ))}
      
      {allMedia.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-4 md:p-8 text-center">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">No Media Found</h2>
          <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
            To get started, place your media files in the following directories:
          </p>
          <div className="bg-gray-900 p-3 md:p-4 rounded text-left inline-block mx-auto overflow-x-auto w-full max-w-full">
            <pre className="text-green-400 text-xs md:text-sm whitespace-pre-wrap break-all">
              /media/movies/Movie1.mp4{'\n'}
              /media/tvshows/TV Show/Season 1/Episode1.mp4{'\n'}
              /media/anime/Anime1.mp4{'\n'}
              /media/musicvideos/MusicVideo1.mp4
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
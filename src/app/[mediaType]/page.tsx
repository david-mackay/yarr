import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMediaByCategory } from '@/lib/mediaLib';
import { ALL_CATEGORIES } from '@/lib/types';
import MediaGrid from '@/app/components/MediaGrid';

interface CategoryPageProps {
  params: {
    mediaType: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { mediaType } = params;
  const category = ALL_CATEGORIES.find(c => c.id === mediaType);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }
  
  return {
    title: `${category.name} | Media Stream`,
    description: `Browse and stream ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { mediaType } = params;
  
  // Validate the category
  const category = ALL_CATEGORIES.find(c => c.id === mediaType);
  
  if (!category) {
    notFound();
  }
  
  const media = await getMediaByCategory(mediaType);
  
  // Filter out episodes for TV shows category
  const filteredMedia = mediaType === 'tvshows' 
    ? media.filter(item => item.type === 'tvshow')
    : media;
  
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{category.name}</h1>
        <p className="text-gray-400 mt-2">
          Browse and stream {category.name}
        </p>
      </div>
      
      <MediaGrid items={filteredMedia} />
    </main>
  );
}
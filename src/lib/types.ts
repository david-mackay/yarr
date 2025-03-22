export interface MediaItem {
    id: string;
    title: string;
    path: string;
    type: MediaType;
    category: string;
    thumbnailPath?: string;
    seasons?: Season[];
    parent?: string;
  }
  
  export interface Season {
    id: string;
    title: string;
    episodes: MediaItem[];
    parent: string;
  }
  
  export type MediaType = 'movie' | 'tvshow' | 'episode' | 'custom';
  
  export interface MediaCategory {
    id: string;
    name: string;
    type: MediaType;
  }
  
  export const DEFAULT_CATEGORIES: MediaCategory[] = [
    { id: 'movies', name: 'Movies', type: 'movie' },
    { id: 'tvshows', name: 'TV Shows', type: 'tvshow' },
  ];
  
  // You can add custom categories here
  export const CUSTOM_CATEGORIES: MediaCategory[] = [
    { id: 'anime', name: 'Anime', type: 'custom' },
    { id: 'musicvideos', name: 'Music Videos', type: 'custom' },
  ];
  
  export const ALL_CATEGORIES = [...DEFAULT_CATEGORIES, ...CUSTOM_CATEGORIES];
import fs from 'fs';
import path from 'path';
import { MediaItem, MediaType, Season } from './types';

// Base directory for media files - you can change this to match your setup
const MEDIA_DIR = process.env.MEDIA_DIR || path.join(process.cwd(), 'media');

// Supported video file extensions
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v'];

// Create media directory if it doesn't exist
export function ensureMediaDirs() {
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR);
    fs.mkdirSync(path.join(MEDIA_DIR, 'movies'));
    fs.mkdirSync(path.join(MEDIA_DIR, 'tvshows'));
  }
}

// Scan the media directory and return all media items
export async function getAllMedia(): Promise<MediaItem[]> {
  ensureMediaDirs();
  const allMedia: MediaItem[] = [];
  
  // Get movies
  const movies = await getMovies();
  allMedia.push(...movies);
  
  // Get TV shows (including episodes)
  const tvShows = await getTvShows();
  allMedia.push(...tvShows);
  
  // Get custom categories
  const customMedia = await getCustomMedia();
  allMedia.push(...customMedia);
  
  return allMedia;
}

// Get all movies
export async function getMovies(): Promise<MediaItem[]> {
  const moviesDir = path.join(MEDIA_DIR, 'movies');
  
  if (!fs.existsSync(moviesDir)) {
    fs.mkdirSync(moviesDir, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(moviesDir);
  
  return files
    .filter(file => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map(file => {
      const id = path.parse(file).name.replace(/\s+/g, '-').toLowerCase();
      const title = path.parse(file).name;
      
      return {
        id,
        title,
        path: `/movies/${file}`,
        type: 'movie' as MediaType,
        category: 'movies',
      };
    });
}

// Get all TV shows and their episodes
export async function getTvShows(): Promise<MediaItem[]> {
  const tvShowsDir = path.join(MEDIA_DIR, 'tvshows');
  
  if (!fs.existsSync(tvShowsDir)) {
    fs.mkdirSync(tvShowsDir, { recursive: true });
    return [];
  }
  
  const shows = fs.readdirSync(tvShowsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  const tvShows: MediaItem[] = [];
  
  for (const show of shows) {
    const showId = show.replace(/\s+/g, '-').toLowerCase();
    const showDir = path.join(tvShowsDir, show);
    const seasons = fs.readdirSync(showDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.toLowerCase().includes('season'))
      .map(dirent => dirent.name);
    
    const seasonObjects: Season[] = [];
    
    for (const season of seasons) {
      const seasonId = `${showId}-${season.replace(/\s+/g, '-').toLowerCase()}`;
      const seasonDir = path.join(showDir, season);
      const episodes = fs.readdirSync(seasonDir)
        .filter(file => VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
        .map(file => {
          const episodeId = `${seasonId}-${path.parse(file).name.replace(/\s+/g, '-').toLowerCase()}`;
          const episodeTitle = path.parse(file).name;
          
          return {
            id: episodeId,
            title: episodeTitle,
            path: `/tvshows/${show}/${season}/${file}`,
            type: 'episode' as MediaType,
            category: 'tvshows',
            parent: seasonId,
          };
        });
      
      seasonObjects.push({
        id: seasonId,
        title: season,
        episodes,
        parent: showId,
      });
    }
    
    tvShows.push({
      id: showId,
      title: show,
      path: `/tvshows/${show}`,
      type: 'tvshow' as MediaType,
      category: 'tvshows',
      seasons: seasonObjects,
    });
  }
  
  return tvShows;
}

// Get media from custom categories
export async function getCustomMedia(): Promise<MediaItem[]> {
  const customMedia: MediaItem[] = [];
  const baseDir = MEDIA_DIR;
  
  // Read all directories in the media folder
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  
  for (const entry of entries) {
    // Skip the default movies and tvshows directories
    if (!entry.isDirectory() || entry.name.toLowerCase() === 'movies' || entry.name.toLowerCase() === 'tvshows') {
      continue;
    }
    
    const categoryId = entry.name.replace(/\s+/g, '-').toLowerCase();
    const categoryDir = path.join(baseDir, entry.name);
    
    // Read all files in the custom category directory
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      
      // Skip directories and non-video files
      if (fs.statSync(filePath).isDirectory() || !VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
        continue;
      }
      
      const id = `${categoryId}-${path.parse(file).name.replace(/\s+/g, '-').toLowerCase()}`;
      const title = path.parse(file).name;
      
      customMedia.push({
        id,
        title,
        path: `/${entry.name}/${file}`,
        type: 'custom' as MediaType,
        category: categoryId,
      });
    }
  }
  
  return customMedia;
}

// Get a specific media item by ID
export async function getMediaItemById(id: string): Promise<MediaItem | null> {
  const allMedia = await getAllMedia();
  
  // Search for the media item in the flat list
  let mediaItem = allMedia.find(item => item.id === id);
  
  // If not found in the flat list, search in TV show episodes
  if (!mediaItem) {
    for (const show of allMedia.filter(item => item.type === 'tvshow')) {
      if (show.seasons) {
        for (const season of show.seasons) {
          const episode = season.episodes.find(ep => ep.id === id);
          if (episode) {
            return episode;
          }
        }
      }
    }
  }
  
  return mediaItem || null;
}

// Get the absolute file path for a media item
export function getAbsoluteFilePath(relativePath: string): string {
  // Handle URL-encoded paths (for paths with spaces and special characters)
  const decodedPath = decodeURIComponent(relativePath);
  return path.join(MEDIA_DIR, ...decodedPath.split('/').filter(Boolean));
}

// Get all media items by category
export async function getMediaByCategory(category: string): Promise<MediaItem[]> {
  const allMedia = await getAllMedia();
  return allMedia.filter(item => item.category === category);
}
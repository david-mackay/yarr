'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MediaPlayerProps {
  src: string;
  title: string;
}

export default function MediaPlayer({ src, title }: MediaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    // Detect iOS devices
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isiOS);
    
    // Add escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
            .then(() => router.back())
            .catch(err => console.log('Error exiting fullscreen:', err));
        } else {
          router.back();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Add error logging
    const video = videoRef.current;
    if (video) {
      const handleVideoError = () => {
        if (video.error) {
          setError(`Error ${video.error.code}: ${video.error.message}`);
          console.error("Video error:", video.error.code, video.error.message);
        }
      };
      
      // Log all media events for debugging
      const events = ['loadstart', 'progress', 'suspend', 'abort', 
        'error', 'emptied', 'stalled', 'loadedmetadata', 
        'loadeddata', 'canplay', 'canplaythrough', 
        'playing', 'waiting', 'seeking', 'seeked'];
      
      events.forEach(event => {
        video.addEventListener(event, () => {
          console.log(`Media event: ${event}, readyState: ${video.readyState}`);
        });
      });
      
      video.addEventListener('error', handleVideoError);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        events.forEach(event => {
          video.removeEventListener(event, () => {});
        });
        video.removeEventListener('error', handleVideoError);
      };
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);
  
  // Add special handling for iOS
  useEffect(() => {
    if (isIOS && videoRef.current) {
      const video = videoRef.current;
      
      // iOS sometimes needs a user interaction to start playback
      const handleUserInteraction = () => {
        if (video.paused) {
          video.play().catch(err => {
            console.error("iOS play error:", err);
            setError("iOS playback error: " + err.message);
          });
        }
      };
      
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', handleUserInteraction);
      };
    }
  }, [isIOS]);
  
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
        .catch(err => console.log('Error exiting fullscreen:', err));
    } else if (videoRef.current) {
      videoRef.current.requestFullscreen()
        .catch(err => console.log('Error requesting fullscreen:', err));
    }
  };
  
  // Modify src URL for iOS if needed
  const getMediaSource = () => {
    // Add a cache-busting parameter for iOS devices
    if (isIOS) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}_ios=1`;
    }
    return src;
  };
  
  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="p-4 bg-gray-900 flex items-center justify-between">
        <h1 className="text-white text-xl font-medium truncate">{title}</h1>
        <button 
          onClick={() => router.back()} 
          className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded"
        >
          Back
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center relative">
        {error && (
          <div className="absolute top-0 bg-red-600 text-white p-2 w-full text-center z-10">
            {error}
          </div>
        )}
        
        <video 
          ref={videoRef}
          className="w-full h-auto max-h-full"
          controls
          autoPlay={!isIOS} // Don't autoplay on iOS - needs user interaction
          controlsList="nodownload"
          playsInline
          webkit-playsinline="true"
          x-webkit-airplay="allow"
          preload="auto"
          onDoubleClick={toggleFullscreen}
          onError={(e) => console.error("Video error:", e)}
        >
          <source src={getMediaSource()} type="video/mp4" />
          {isIOS && (
            <p className="text-white bg-black p-4">
              iOS device detected. If you're having trouble with playback,
              try tapping the play button or download for offline viewing.
            </p>
          )}
        </video>
      </div>
      
      {isIOS && (
        <div className="bg-yellow-700 p-2 text-center">
          <button
            onClick={() => videoRef.current?.play()}
            className="bg-yellow-600 text-white py-1 px-3 rounded mr-2"
          >
            Force Play
          </button>
          <a 
            href={src} 
            download={title}
            className="bg-blue-600 text-white py-1 px-3 rounded"
          >
            Download for Offline Viewing
          </a>
        </div>
      )}
    </div>
  );
}
'use client';

import YouTube from 'react-youtube-embed';

interface YouTubeEmbedProps {
  url: string;
  title?: string;
}

export default function YouTubeEmbed({ url, title }: YouTubeEmbedProps) {
  // Extract video ID from URL
  let videoId = '';
  let startTime = '';

  try {
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
      const t = urlObj.searchParams.get('t');
      if (t) {
        // Convert '302s' to '302' or just use the number
        startTime = t.replace(/[^0-9]/g, '');
      }
    } else if (url.includes('youtu.be/')) {
      const urlObj = new URL(url);
      videoId = urlObj.pathname.split('/').pop() || '';
      const t = urlObj.searchParams.get('t');
      if (t) {
        startTime = t.replace(/[^0-9]/g, '');
      }
    }
  } catch (e) {
    console.warn('Failed to parse YouTube URL:', url);
  }

  if (!videoId) {
    return (
      <div className="my-8 rounded-lg overflow-hidden border border-border shadow-lg bg-dark-alt p-8 text-center">
        <p className="text-text-muted">Invalid YouTube URL</p>
      </div>
    );
  }

  // Build embed URL with start time if provided
  const embedUrl = startTime 
    ? `https://www.youtube.com/embed/${videoId}?start=${startTime}`
    : `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="my-8 rounded-lg overflow-hidden border border-border shadow-lg">
      <div className="w-full aspect-video">
        <YouTube id={videoId} />
      </div>
      {title && (
        <p className="text-sm text-text-muted text-center py-3 bg-dark-alt border-t border-border">
          {title}
        </p>
      )}
    </div>
  );
}


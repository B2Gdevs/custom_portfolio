'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ExternalLink, Video, BookOpen } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video' | 'external' | 'documentation';
  src?: string;
  url?: string;
  title?: string;
  thumbnail?: string;
}

interface ProjectMediaSidebarProps {
  mediaItems: MediaItem[];
  galleryImages: string[];
  projectTitle: string;
}

export default function ProjectMediaSidebar({
  mediaItems,
  galleryImages,
  projectTitle,
}: ProjectMediaSidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Combine gallery images with media items
  const allMedia: MediaItem[] = [
    ...galleryImages.map((img) => ({ type: 'image' as const, src: img })),
    ...mediaItems,
  ];

  useEffect(() => {
    if (allMedia.length === 0) return;

    const observers: IntersectionObserver[] = [];

    // Find all gallery image containers
    const galleryContainer = document.querySelector('[data-gallery-container]');
    const imageContainers: Element[] = [];
    
    if (galleryContainer) {
      const containers = galleryContainer.querySelectorAll('[data-gallery-image]');
      containers.forEach((container) => imageContainers.push(container));
    }

    // Function to find which image is currently most visible/centered
    const findActiveIndex = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = -1;
      let closestDistance = Infinity;

      // Check gallery images
      imageContainers.forEach((container, index) => {
        const rect = container.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        
        // Only consider if element is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      // If we found a gallery image, use it
      if (closestIndex >= 0) {
        setActiveIndex(closestIndex);
        setIsVisible(true);
        return;
      }

      // Check if we're past the gallery
      if (galleryImages.length > 0 && imageContainers.length > 0) {
        const lastImage = imageContainers[imageContainers.length - 1];
        const lastRect = lastImage.getBoundingClientRect();
        
        // If last gallery image is above viewport center, show first media item
        if (lastRect.bottom < viewportCenter && mediaItems.length > 0) {
          setActiveIndex(galleryImages.length);
          setIsVisible(true);
          return;
        }
      }

      // If no gallery or we're before it, show first item
      if (galleryImages.length === 0 && mediaItems.length > 0) {
        setActiveIndex(0);
        setIsVisible(true);
      } else if (galleryImages.length > 0 && imageContainers.length > 0) {
        // Before gallery, show first gallery image
        setActiveIndex(0);
        setIsVisible(true);
      }
    };

    // Use intersection observers for each gallery image
    if (imageContainers.length > 0) {
      imageContainers.forEach((container, index) => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                // When image enters viewport, check which is closest
                findActiveIndex();
              }
            });
          },
          {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            rootMargin: '-10% 0px -10% 0px',
          }
        );

        observer.observe(container);
        observers.push(observer);
      });
    }

    // Use scroll event for real-time updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          findActiveIndex();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check
    findActiveIndex();

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Observe main content for media items when past gallery
    if (galleryImages.length > 0 && mediaItems.length > 0) {
      const contentObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Check if gallery is completely above viewport
              const galleryRect = galleryContainer?.getBoundingClientRect();
              if (galleryRect && galleryRect.bottom < 100) {
                setActiveIndex(galleryImages.length);
                setIsVisible(true);
              }
            }
          });
        },
        {
          threshold: 0.1,
        }
      );

      const mainContent = document.querySelector('.prose');
      if (mainContent) {
        contentObserver.observe(mainContent);
        observers.push(contentObserver);
      }
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [galleryImages, mediaItems.length, allMedia.length]);

  const currentMedia = allMedia[activeIndex];

  if (allMedia.length === 0) return null;

  return (
    <div
      ref={sidebarRef}
      className={`sticky top-24 h-[calc(100vh-8rem)] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-border shadow-xl bg-dark-elevated">
          {currentMedia && (
            <>
              {currentMedia.type === 'image' && currentMedia.src && (
                <div className="relative w-full h-full">
                  <Image
                    src={currentMedia.src}
                    alt={`${projectTitle} - Image ${activeIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}

              {currentMedia.type === 'video' && currentMedia.url && (
                <a
                  href={currentMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                >
                  <div className="relative w-full h-full bg-gradient-to-br from-red-600/20 to-red-800/20 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Video className="text-white w-10 h-10" />
                        </div>
                      </div>
                      <p className="text-primary font-semibold mb-2">{currentMedia.title || 'Watch Video'}</p>
                      <p className="text-text-muted text-sm">Click to watch on YouTube</p>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                </a>
              )}

              {currentMedia.type === 'external' && (
                <a
                  href={currentMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                >
                  {currentMedia.thumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={currentMedia.thumbnail}
                        alt={currentMedia.title || 'External link'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ExternalLink className="text-white w-12 h-12" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-secondary/20 p-6">
                      <div className="text-center">
                        <ExternalLink className="w-12 h-12 mx-auto mb-4 text-accent" />
                        <p className="text-primary font-semibold">{currentMedia.title || 'External Link'}</p>
                        <p className="text-text-muted text-sm mt-2">{currentMedia.url}</p>
                      </div>
                    </div>
                  )}
                </a>
              )}

              {currentMedia.type === 'documentation' && (
                <a
                  href={currentMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full relative group"
                >
                  {currentMedia.thumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={currentMedia.thumbnail}
                        alt={currentMedia.title || 'Documentation'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <BookOpen className="text-white w-12 h-12" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/20 to-accent/20 p-6">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-secondary" />
                        <p className="text-primary font-semibold">{currentMedia.title || 'Documentation'}</p>
                        <p className="text-text-muted text-sm mt-2">View Docs</p>
                      </div>
                    </div>
                  )}
                </a>
              )}
            </>
          )}

          {/* Media indicator dots */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-accent w-6'
                      : 'bg-text-muted hover:bg-text-primary'
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
}


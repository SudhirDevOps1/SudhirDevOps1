import React, { useCallback, useState } from 'react';

/**
 * Production-safe image component.
 * - Shows an animated shimmer skeleton while loading
 * - Falls back to a graceful placeholder on error (never shows a broken glyph)
 * - Uses transform/opacity reveal (compositor-friendly, 60fps)
 * - Honors prefers-reduced-motion
 * - Lazy-loads below-the-fold images
 */
interface AnimatedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  lazy?: boolean;
  reveal?: boolean;
}

const FALLBACK =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=github-studio&backgroundColor=b8e3e6';

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = FALLBACK,
  width,
  height,
  lazy = true,
  reveal = true,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(false);
  }, []);

  // Mount-based reveal so the skeleton doesn't flash on fast loads
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const showSkeleton = mounted && !loaded && !error;
  const effectiveSrc = error ? fallbackSrc : src;

  return (
    <span
      className={[
        'relative inline-block overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'inline-block',
      }}
    >
      {/* Shimmer skeleton while loading */}
      {showSkeleton && (
        <span
          className="absolute inset-0 skeleton-block animate-pulse-shimmer"
          style={{
            background:
              'linear-gradient(90deg, #111827 0%, #1f2937 50%, #111827 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      <img
        src={effectiveSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        fetchPriority={lazy ? 'low' : 'high'}
        onLoad={handleLoad}
        onError={handleError}
        className={[
          'block max-w-full h-auto rounded-lg shadow',
          reveal ? 'animate-image-reveal' : '',
          error ? 'opacity-50 grayscale filter' : '',
          loaded ? '' : 'opacity-0',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          objectFit: 'cover',
          opacity: loaded && !error ? 1 : 0,
          transition: 'opacity 0.4s ease, transform 0.3s ease',
        }}
      />

      {/* Graceful fallback badge when the source failed */}
      {error && !loaded && (
        <span
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-800/90 border border-slate-700 text-slate-400 text-[10px] font-mono uppercase tracking-wider pointer-events-none"
        >
          image unavailable
        </span>
      )}
    </span>
  );
};

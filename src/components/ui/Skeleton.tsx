import React from 'react';

/**
 * Animated skeleton placeholder that mirrors the shape of real content.
 * Uses compositor-friendly transform/opacity only. Honors prefers-reduced-motion.
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  pulse?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1em',
  radius = '0.375rem',
  pulse = true,
}) => {
  return (
    <span
      className={[
        'skeleton-block',
        pulse ? 'animate-pulse-shimmer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        height,
        borderRadius: radius,
        display: 'inline-block',
        background:
          'linear-gradient(90deg, #111827 0%, #1f2937 50%, #111827 100%)',
        backgroundSize: '200% 100%',
      }}
      aria-hidden="true"
    />
  );
};

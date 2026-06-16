import React, { useRef, useState, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // max rotation degrees
  glare?: boolean; // show moving glare
  scale?: number; // hover scale
  as?: 'div' | 'article' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Interactive 3D tilt card.
 * Follows the mouse/pointer for a real perspective tilt,
 * lifts up smoothly on hover, and scales down subtly on tap.
 * Fully touch-friendly (works on mobile via pointer events).
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 8,
  glare = true,
  scale = 1.02,
  as = 'div',
  href,
  target,
  rel,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, o: 0 });

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const rotateY = (px - 0.5) * intensity * 2;
      const rotateX = -(py - 0.5) * intensity * 2;
      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(${scale})`,
      });
      setGlarePos({ x: px * 100, y: py * 100, o: 0.18 });
    },
    [intensity, scale]
  );

  const handleEnter = useCallback(() => {
    setGlarePos((p) => ({ ...p, o: 0.18 }));
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)' });
    setGlarePos((p) => ({ ...p, o: 0 }));
  }, []);

  const handleDown = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(2px) scale(0.96)',
      transition: 'transform 0.08s ease',
    });
  }, []);

  const glareStyle: React.CSSProperties = glare
    ? {
        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%)`,
        opacity: glarePos.o,
      }
    : {};

  const baseClass = `relative transform-gpu transition-transform duration-300 ease-out ${className}`;

  const inner = (
    <>
      {children}
      {glare && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 mix-blend-overlay"
          style={glareStyle}
        />
      )}
    </>
  );

  const commonProps = {
    ref: ref as any,
    className: baseClass,
    onPointerMove: handleMove,
    onPointerEnter: handleEnter,
    onPointerLeave: handleLeave,
    onPointerDown: handleDown,
    onClick,
    style,
  };

  if (as === 'a' && href) {
    return (
      <a {...(commonProps as any)} href={href} target={target} rel={rel}>
        {inner}
      </a>
    );
  }

  return <div {...commonProps}>{inner}</div>;
};

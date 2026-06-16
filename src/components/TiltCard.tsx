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
  glowColor?: string; // e.g. 'rgba(34, 211, 238,' or '#22d3ee'
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Ultra-Premium 3D Tilt Card with Dynamic Mouse Spotlight / Glare.
 * - Follows cursor exactly to create holographic 3D tilt.
 * - Renders a brilliant dynamic colored spot-glow exactly where the pointer moves!
 * - Renders exquisite frosted glass UI transparency & subtle tap scale-down.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 10,
  glare = true,
  scale = 1.02,
  as = 'div',
  href,
  target,
  rel,
  glowColor = 'rgba(34, 211, 238,', // default cyan glow
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, o: 0 });

  // Format glow color to rgba prefix if hex is passed
  const formattedGlow = glowColor.startsWith('#')
    ? `rgba(${parseInt(glowColor.slice(1, 3), 16)}, ${parseInt(glowColor.slice(3, 5), 16)}, ${parseInt(glowColor.slice(5, 7), 16)},`
    : glowColor.endsWith(',') ? glowColor : `${glowColor},`;

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
        transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(${scale})`,
        boxShadow: `0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 32px -6px ${formattedGlow} 0.35)`,
        borderColor: `${formattedGlow} 0.5)`,
      });
      setGlarePos({ x: px * 100, y: py * 100, o: 1 });
    },
    [intensity, scale, formattedGlow]
  );

  const handleEnter = useCallback(() => {
    setGlarePos((p) => ({ ...p, o: 1 }));
  }, []);

  const handleLeave = useCallback(() => {
    setStyle({ 
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
      boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.5)',
      borderColor: 'transparent',
    });
    setGlarePos((p) => ({ ...p, o: 0 }));
  }, []);

  const handleDown = useCallback(() => {
    setStyle((prev) => ({
      ...prev,
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(2px) scale(0.96)',
      transition: 'transform 0.08s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.08s ease',
    }));
  }, []);

  // Gorgeous layered dynamic cursor spotlight
  const pointerGlowStyle: React.CSSProperties = glare
    ? {
        background: `
          radial-gradient(circle 180px at ${glarePos.x}% ${glarePos.y}%, ${formattedGlow} 0.22), transparent 80%),
          radial-gradient(circle 80px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.25), transparent 70%)
        `,
        opacity: glarePos.o,
      }
    : {};

  const baseClass = `relative transform-gpu transition-all duration-300 ease-out border border-white/5 hover:border-white/20 rounded-2xl ${className}`;

  const inner = (
    <>
      <div className="relative z-10 flex flex-col h-full">{children}</div>
      {glare && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 overflow-hidden"
          style={pointerGlowStyle}
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

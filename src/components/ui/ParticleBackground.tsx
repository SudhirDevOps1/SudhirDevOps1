import React, { useEffect, useRef } from 'react';

/**
 * Advanced WebGL-free canvas particle network background.
 * - GPU-friendly 2D canvas (no DOM nodes per particle)
 * - Responsive, throttled resize, pauses when tab hidden
 * - Honors prefers-reduced-motion
 * - Purely decorative — aria-hidden, no interaction
 */
interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  color?: string;
  connectDistance?: number;
  speed?: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  className = '',
  particleCount = 40,
  color = '#22d3ee',
  connectDistance = 150,
  speed = 0.35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || { width: 0, height: 0 };
      const dpr = window.devicePixelRatio || 1;
      width = rect.width || 0;
      height = rect.height || 0;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.max(8, Math.floor((width * height) / 18000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed * 0.8,
          vy: (Math.random() - 0.5) * speed * 0.8,
          size: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.55;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDistance) {
            ctx.globalAlpha = 0.55 * (1 - dist / connectDistance);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);

    // Pause when tab hidden to save battery
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        draw();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [color, connectDistance, particleCount, speed, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={[
        'absolute inset-0 -z-10 w-full h-full pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
      style={{ opacity: reducedMotion ? 0 : 1 }}
    />
  );
};

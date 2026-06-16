import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

/**
 * Smoothly counts up to the real value when it scrolls into view.
 * Uses the actual live value — purely a presentation animation.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1200,
  className = '',
  suffix = '',
}) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // easeOutExpo
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              setDisplay(Math.round(eased * value));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  // If value changes after first render (e.g. data loaded), update.
  useEffect(() => {
    if (started.current) setDisplay(value);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}{suffix}
    </span>
  );
};

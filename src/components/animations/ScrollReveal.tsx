import { useEffect, useRef, ReactNode } from 'react';
import { animateScrollReveal, animateStaggerChildren } from '@/lib/gsap-animations';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: boolean;
  staggerDelay?: number;
  className?: string;
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  duration = 1,
  y = 50,
  stagger = false,
  staggerDelay = 0.15,
  className = ''
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stagger) {
      animateStaggerChildren(containerRef.current, {
        delay,
        duration,
        y,
        stagger: staggerDelay
      });
    } else {
      animateScrollReveal(containerRef.current, {
        delay,
        duration,
        y
      });
    }
  }, [delay, duration, y, stagger, staggerDelay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

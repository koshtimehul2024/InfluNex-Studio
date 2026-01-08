import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

interface InfluNexLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function InfluNexLoader({ isLoading, onComplete }: InfluNexLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGPathElement>(null);
  const liquidGroupRef = useRef<SVGGElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const waveAnimationRef = useRef<gsap.core.Tween | null>(null);
  const fillAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      // Complete the fill, then fade out
      if (fillAnimationRef.current) {
        fillAnimationRef.current.kill();
      }
      
      if (liquidGroupRef.current) {
        gsap.to(liquidGroupRef.current, {
          y: -100,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            // Fade out entire container
            setIsVisible(false);
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => {
                if (waveAnimationRef.current) {
                  waveAnimationRef.current.kill();
                }
                onComplete?.();
              }
            });
          }
        });
      }
    } else if (isLoading && containerRef.current && waveRef.current && liquidGroupRef.current) {
      // Reset opacity and visibility
      setIsVisible(true);
      gsap.set(containerRef.current, { opacity: 1 });
      gsap.set(liquidGroupRef.current, { y: 0 });

      // Infinite wave animation with realistic fluid motion
      waveAnimationRef.current = gsap.to(waveRef.current, {
        attr: { 
          d: 'M-100,50 Q-75,45 -50,50 T0,50 T50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 V200 H-100 Z' 
        },
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

      // Continuous horizontal wave movement (infinite scroll effect)
      gsap.to(waveRef.current, {
        x: -50,
        duration: 3,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: (x) => `${parseFloat(x) % 50}`
        }
      });

      // Gradual liquid rise to 80%
      fillAnimationRef.current = gsap.to(liquidGroupRef.current, {
        y: -80,
        duration: 2.5,
        ease: 'power1.inOut'
      });
    }

    return () => {
      if (waveAnimationRef.current) {
        waveAnimationRef.current.kill();
      }
      if (fillAnimationRef.current) {
        fillAnimationRef.current.kill();
      }
    };
  }, [isLoading, onComplete]);

  if (!isLoading && !containerRef.current) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700",
        isVisible ? "opacity-100 backdrop-blur-0" : "opacity-0 pointer-events-none"
      )}
      style={{ 
        backgroundColor: '#0E0E0E',
      }}
    >
      {/* Blur layer behind loader */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      <div className="relative z-10">
        {/* Glow reflection under liquid */}
        <div 
          ref={glowRef}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-96 h-24 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, #F2C94C, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
        
        <div className="relative w-[400px] h-[140px]">
          <svg
            viewBox="0 0 400 120"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            {/* Mask for liquid fill */}
            <mask id="textMask">
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ 
                  fontSize: '48px', 
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 700
                }}
                fill="white"
              >
                InfluNex
              </text>
            </mask>

            {/* Liquid gradient */}
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F2C94C" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F2C94C" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background text (subtle) */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ 
              fontSize: '48px', 
              fontFamily: "'Poppins', 'Inter', sans-serif",
              fontWeight: 700
            }}
            fill="white"
            opacity="0.25"
          >
            InfluNex
          </text>

          {/* Liquid fill group */}
          <g ref={liquidGroupRef} mask="url(#textMask)">
            {/* Animated wave */}
            <path
              ref={waveRef}
              d="M-100,50 Q-75,48 -50,50 T0,50 T50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 V200 H-100 Z"
              fill="url(#liquidGradient)"
              style={{ filter: 'blur(1px)' }}
            />
          </g>
        </svg>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { animatePageEnter, refreshScrollTrigger } from '@/lib/gsap-animations';
import gsap from 'gsap';

export function usePageTransition() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Enhanced page enter animation with GSAP
    gsap.fromTo(
      'main',
      { 
        opacity: 0, 
        y: 20,
        filter: 'blur(8px)'
      },
      { 
        opacity: 1, 
        y: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out'
      }
    );
    
    // Trigger page enter animation
    animatePageEnter();
    
    // Refresh ScrollTrigger after route change
    setTimeout(() => {
      refreshScrollTrigger();
    }, 100);
  }, [location.pathname]);
}

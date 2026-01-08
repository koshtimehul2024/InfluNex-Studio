import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Text Reveal Animations
export const animateTextReveal = (element: HTMLElement | null, options?: {
  delay?: number;
  stagger?: number;
  duration?: number;
}) => {
  if (!element) return;

  const chars = element.textContent?.split('') || [];
  element.innerHTML = '';
  
  chars.forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    element.appendChild(span);
  });

  gsap.to(element.children, {
    opacity: 1,
    y: 0,
    duration: options?.duration || 0.8,
    stagger: options?.stagger || 0.02,
    delay: options?.delay || 0,
    ease: 'power3.out',
    force3D: true
  });
};

export const animateWordReveal = (element: HTMLElement | null, options?: {
  delay?: number;
  stagger?: number;
  duration?: number;
}) => {
  if (!element) return;

  const words = element.textContent?.split(' ') || [];
  element.innerHTML = '';
  
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(20px)';
    element.appendChild(span);
    
    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  gsap.to(element.children, {
    opacity: 1,
    y: 0,
    duration: options?.duration || 1,
    stagger: options?.stagger || 0.1,
    delay: options?.delay || 0,
    ease: 'power3.out',
    force3D: true
  });
};

// Scroll Reveal Animation
export const animateScrollReveal = (element: HTMLElement | null, options?: {
  delay?: number;
  duration?: number;
  y?: number;
  start?: string;
}) => {
  if (!element) return;

  gsap.fromTo(element,
    {
      opacity: 0,
      y: options?.y || 50
    },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration || 1,
      delay: options?.delay || 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: options?.start || 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );
};

// Stagger Children Animation
export const animateStaggerChildren = (container: HTMLElement | null, options?: {
  delay?: number;
  stagger?: number;
  duration?: number;
  y?: number;
}) => {
  if (!container) return;

  const children = Array.from(container.children);

  gsap.fromTo(children,
    {
      opacity: 0,
      y: options?.y || 40
    },
    {
      opacity: 1,
      y: 0,
      duration: options?.duration || 0.8,
      stagger: options?.stagger || 0.15,
      delay: options?.delay || 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    }
  );
};

// Parallax Effect
export const animateParallax = (element: HTMLElement | null, options?: {
  speed?: number;
  start?: string;
  end?: string;
}) => {
  if (!element) return;

  gsap.to(element, {
    y: () => (options?.speed || 50) * -1,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: options?.start || 'top bottom',
      end: options?.end || 'bottom top',
      scrub: 1
    }
  });
};

// Mouse Parallax Effect
export const initMouseParallax = (container: HTMLElement | null, elements: HTMLElement[]) => {
  if (!container) return;

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const xPercent = (clientX / innerWidth - 0.5) * 2;
    const yPercent = (clientY / innerHeight - 0.5) * 2;

    elements.forEach((element, index) => {
      const speed = (index + 1) * 10;
      gsap.to(element, {
        x: xPercent * speed,
        y: yPercent * speed,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  };

  container.addEventListener('mousemove', handleMouseMove);
  
  return () => container.removeEventListener('mousemove', handleMouseMove);
};

// Scale on Hover
export const animateScaleHover = (element: HTMLElement | null, scale = 1.05) => {
  if (!element) return;

  element.addEventListener('mouseenter', () => {
    gsap.to(element, {
      scale,
      duration: 0.4,
      ease: 'power2.out'
    });
  });

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out'
    });
  });
};

// Page Transition
export const animatePageExit = (callback: () => void) => {
  gsap.to('body', {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: callback
  });
};

export const animatePageEnter = () => {
  gsap.fromTo('body',
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    }
  );
};

// Gradient Spotlight that follows cursor
export const initGradientSpotlight = (container: HTMLElement | null, spotlight: HTMLElement | null) => {
  if (!container || !spotlight) return;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    spotlight.style.setProperty('--mouse-x', `${x}%`);
    spotlight.style.setProperty('--mouse-y', `${y}%`);
    
    gsap.to(spotlight, {
      opacity: 1,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    gsap.to(spotlight, {
      opacity: 0,
      duration: 0.5,
    });
  };

  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseleave', handleMouseLeave);
  
  return () => {
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Create floating particles
export const createFloatingParticles = (container: HTMLElement, count: number = 20) => {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: hsl(var(--primary));
      border-radius: 50%;
      opacity: ${Math.random() * 0.3 + 0.1};
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      pointer-events: none;
    `;
    
    container.appendChild(particle);
    
    gsap.to(particle, {
      y: `${Math.random() * 100 - 50}`,
      x: `${Math.random() * 100 - 50}`,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
};

// Refresh ScrollTrigger
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

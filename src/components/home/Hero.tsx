import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { animateWordReveal, animateParallax, initMouseParallax, createFloatingParticles } from "@/lib/gsap-animations";
import gsap from "gsap";
import HomeStats from "./HomeStats";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const autoSpotlightRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState({
    hero_heading: 'Influence. Elevated.',
    hero_subheading: 'Premium influencer marketing and creative solutions for modern brands',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('settings').select('hero_heading, hero_subheading').single();
      if (data) setSettings(data);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title with word reveal
      if (titleRef.current) {
        animateWordReveal(titleRef.current, {
          delay: 0.2,
          stagger: 0.08,
          duration: 1.2
        });
      }

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.8,
        ease: "power3.out",
      });

      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1.2,
        ease: "power3.out",
      });

      // Animated auto-moving spotlight (Obys style)
      if (autoSpotlightRef.current) {
        gsap.to(autoSpotlightRef.current, {
          backgroundPosition: '100% 100%',
          duration: 8,
          ease: 'none',
          repeat: -1,
          yoyo: true,
        });
      }

      // Parallax effect on background elements
      const bgElements = heroRef.current?.querySelectorAll('.absolute > div');
      if (bgElements) {
        bgElements.forEach((el, index) => {
          animateParallax(el as HTMLElement, { 
            speed: 30 + (index * 10) 
          });
        });
      }
    }, heroRef);

    // Mouse parallax for background elements
    const bgElements = Array.from(
      heroRef.current?.querySelectorAll('.bg-primary\\/10, .bg-primary\\/5') || []
    ) as HTMLElement[];
    
    const cleanupParallax = initMouseParallax(heroRef.current, bgElements);
    
    // Gradient spotlight that follows cursor
    const container = heroRef.current;
    const spotlight = spotlightRef.current;
    
    let cleanupSpotlight: (() => void) | undefined;
    if (container && spotlight) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        spotlight.style.setProperty('--mouse-x', `${x}%`);
        spotlight.style.setProperty('--mouse-y', `${y}%`);
        spotlight.style.opacity = '1';
      };
      
      const handleMouseLeave = () => {
        spotlight.style.opacity = '0';
      };
      
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      cleanupSpotlight = () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
    
    // Create floating particles
    if (particlesRef.current) {
      createFloatingParticles(particlesRef.current, 20);
    }

    return () => {
      ctx.revert();
      cleanupParallax?.();
      cleanupSpotlight?.();
    };
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-charcoal-light" />
      
      {/* Auto-Animated Spotlight (Obys style) */}
      <div 
        ref={autoSpotlightRef}
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(242, 201, 76, 0.12) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%',
        }}
      />
      
      {/* Gradient Spotlight Following Cursor */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(242, 201, 76, 0.15), transparent 40%)',
        }}
      />
      
      {/* Floating Particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Premium Influencer Marketing Agency</span>
          </div>

          {/* Main Heading */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
          >
            {settings.hero_heading}
          </h1>

          {/* Subtitle with gold underline animation */}
          <div className="relative inline-block">
            <p
              ref={subtitleRef}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              {settings.hero_subheading}
            </p>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>

          {/* CTAs with enhanced styling */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 group px-8 text-base font-semibold shadow-[0_0_30px_hsl(45_85%_55%_/_0.3)] hover:shadow-[0_0_40px_hsl(45_85%_55%_/_0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link to="/contact">
                Start Your Project
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 px-8 text-base font-semibold hover:-translate-y-0.5 transition-all duration-300"
            >
              <Link to="/portfolio">View Our Work</Link>
            </Button>
          </div>

          {/* Dynamic Stats */}
          <HomeStats />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Hero;

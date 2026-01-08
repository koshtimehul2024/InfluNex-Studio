import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { animateScaleHover } from "@/lib/gsap-animations";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEO } from "@/components/SEO";
import { ImageLightbox } from "@/components/portfolio/ImageLightbox";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  description: string | null;
}

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const [isCategoryBarVisible, setIsCategoryBarVisible] = useState(true);

  useEffect(() => {
    loadPortfolio();
    setupScrollAnimation();
    
    // Add hover scale animations to cards after they're rendered
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.portfolio-card');
      cards.forEach(card => {
        animateScaleHover(card as HTMLElement, 1.03);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const setupScrollAnimation = () => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 300) {
        if (currentScroll > lastScroll) {
          // Scrolling down - hide category bar
          setIsCategoryBarVisible(false);
        } else {
          // Scrolling up - show category bar
          setIsCategoryBarVisible(true);
        }
      } else {
        setIsCategoryBarVisible(true);
      }
      
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  };

  const loadPortfolio = async () => {
    const { data } = await supabase.from('portfolio').select('*').order('created_at', { ascending: false });
    if (data) {
      setPortfolio(data);
      const uniqueCategories = ['all', ...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
    }
  };

  const filteredItems = activeCategory === "all"
    ? portfolio
    : portfolio.filter((item) => item.category === activeCategory);

  // Transform filtered items to lightbox format
  const lightboxImages = filteredItems
    .filter(item => item.image_url)
    .map(item => ({
      url: item.image_url!,
      title: item.title,
      description: item.description,
    }));

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handleLightboxNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  return (
    <>
      <SEO 
        title="Portfolio"
        description="Explore our latest campaigns and success stories. See how InfluNex Studio has helped brands grow through authentic influencer partnerships."
        canonicalPath="/portfolio"
      />
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold">
                Our <span className="text-gradient-gold">Portfolio</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Explore our latest campaigns and success stories across industries
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Category Filter Bar with Scroll Behavior */}
      <div
        ref={categoryBarRef}
        className={`sticky z-40 transition-all duration-500 ${
          isCategoryBarVisible ? 'top-20 translate-y-0' : 'top-0 -translate-y-full'
        }`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="bg-background/70 border-b border-border/30 shadow-lg">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => {
                    setActiveCategory(category);
                    // Smooth scroll animation on category change
                    gsap.to(window, {
                      scrollTo: { y: categoryBarRef.current, offsetY: 100 },
                      duration: 0.8,
                      ease: "power3.inOut"
                    });
                  }}
                  className={`min-w-[120px] capitalize transition-all duration-300 ${
                    activeCategory === category
                      ? 'shadow-[0_0_20px_hsl(var(--primary)/0.5)] scale-105'
                      : 'hover:border-primary/50 hover:scale-105'
                  }`}
                >
                  {category === 'all' ? 'All Projects' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <section className="py-16 pb-28">
        <div className="container mx-auto px-6">
          {portfolio.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <ExternalLink className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Portfolio Items Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our portfolio is being updated. Check back soon to see our latest work.
              </p>
            </div>
          ) : (
            <ScrollReveal stagger staggerDelay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="portfolio-card group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover-lift h-full flex flex-col"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/50 text-foreground"
                          onClick={() => {
                            const imageIndex = lightboxImages.findIndex(img => img.url === item.image_url);
                            if (imageIndex !== -1) openLightbox(imageIndex);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="border-primary/30 text-primary shrink-0">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Premium Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onNavigate={handleLightboxNavigate}
      />
      </div>
    </>
  );
};

export default Portfolio;

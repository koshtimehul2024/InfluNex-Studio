import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface HomeLogo {
  id: string;
  title: string;
  image_url: string | null;
  type: string;
  display_order: number;
}

interface HomeLogosProps {
  type: "customer" | "brand";
  title?: string;
}

const HomeLogos = ({ type, title }: HomeLogosProps) => {
  const [logos, setLogos] = useState<HomeLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogos = async () => {
      try {
        const { data, error } = await supabase
          .from("home_logos")
          .select("*")
          .eq("type", type)
          .eq("is_published", true)
          .order("display_order");

        if (error) throw error;
        if (data) setLogos(data);
      } catch (error) {
        console.error("Error loading logos:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadLogos();
  }, [type]);

  // Force left → right animation for both types per design request
  const trackClass = "marquee-track";

  // Duplicate exactly once: with translateX(-50%) this creates a seamless loop.
  const duplicatedLogos = useMemo(() => {
    if (logos.length === 0) return [];
    return [...logos, ...logos];
  }, [logos]);

  if (loading) {
    return (
      <section className="py-16 bg-card/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (logos.length === 0) return null;

  return (
    <section className="py-16 bg-card/30 overflow-hidden">
      <style>
        {`\
        /* Core marquee animations */\
        :root { --marquee-duration: 18s; } /* faster, premium feel */\
        @keyframes influnex-marquee-ltr {\
          from { transform: translateX(-50%); }\
          to { transform: translateX(0); }\
        }\
        @keyframes influnex-marquee-rtl {\
          from { transform: translateX(0); }\
          to { transform: translateX(-50%); }\
        }\
        .marquee-viewport {\
          overflow: hidden;\
        }\
        .marquee-track {\
          display: inline-flex;\
          gap: 1.5rem; /* tighter spacing to utilize horizontal space */\
          width: max-content;\
          animation: influnex-marquee-ltr var(--marquee-duration) linear infinite;\
          will-change: transform;\
        }\
        .marquee-track--reverse {\
          animation-name: influnex-marquee-rtl;\
        }\
        .marquee-item img {\
          height: 3rem; /* mobile base increased */\
          width: auto;\
          max-width: 46vw;\
          opacity: 1 !important; /* ensure full clarity */\
          filter: none !important;\
        }\
        @media (min-width: 768px) {\
          .marquee-item img { height: 4.5rem; max-width: 300px; }\
        }\
        @media (min-width: 1024px) {\
          .marquee-item img { height: 6rem; max-width: 380px; }\
        }\
        .marquee-item {\
          display: flex;\
          align-items: center;\
          justify-content: center;\
          filter: none;\
          opacity: 1;\
          transition: transform 220ms ease;\
        }\
        .marquee-item:hover {\
          transform: scale(1.03);\
        }\
        /* Respect prefers-reduced-motion */\
        @media (prefers-reduced-motion: reduce) {\
          .marquee-track, .marquee-track--reverse { animation: none; transform: none; }\
        }\
        `}
      </style>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,320px)_1fr] items-center gap-6">
          {/* Title - fixed left on desktop, stacked on mobile */}
          <div className="order-1 md:order-none flex md:block items-center md:items-center">
            {title && (
              <h3 className="text-left md:text-left text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary leading-tight">
                {title}
              </h3>
            )}
          </div>

          {/* Marquee area */}
          <div className="order-2">
            <div className="relative marquee-viewport">
              {/* gradient fades on edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 md:w-28 z-20 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(17,24,39,1), rgba(17,24,39,0))', opacity: 0.98 }} />
              <div className="absolute right-0 top-0 bottom-0 w-20 md:w-28 z-20 pointer-events-none" style={{ background: 'linear-gradient(270deg, rgba(17,24,39,1), rgba(17,24,39,0))', opacity: 0.98 }} />

              <div className={cn('marquee-track', trackClass)}>
                {duplicatedLogos.map((logo, index) => (
                  <div key={`${logo.id}-${index}`} className="marquee-item flex-shrink-0">
                    {logo.image_url ? (
                      <img src={logo.image_url} alt={logo.title} loading="lazy" className="object-contain" />
                    ) : (
                      <div className="px-6 py-2 bg-muted rounded">
                        <span className="text-sm text-muted-foreground font-medium">{logo.title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLogos;
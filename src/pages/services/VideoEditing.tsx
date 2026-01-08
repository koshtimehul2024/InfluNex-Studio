import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Film, Video, Sparkles, Play, ArrowRight } from "lucide-react";
import gsap from "gsap";

const VideoEditing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(".animate-in", {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
      });
    }
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen pt-24">
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-in">
            <Film className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold">
              Professional <span className="text-gradient-gold">Video Editing</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Engaging content for social media, reels, and promotional videos
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Video, title: "Social Media Content", desc: "Optimized videos for Instagram, TikTok, YouTube" },
              { icon: Sparkles, title: "Motion Graphics", desc: "Eye-catching animations and visual effects" },
              { icon: Play, title: "Promotional Videos", desc: "Compelling brand videos that convert" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-8 space-y-4 animate-in hover-lift text-center">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/contact">
              Start Your Project <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default VideoEditing;

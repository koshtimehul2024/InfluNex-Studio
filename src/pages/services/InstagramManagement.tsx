import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Instagram, PenTool, TrendingUp, Users, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const InstagramManagement = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(".animate-in", {
        opacity: 0,
        y: 40,
        stagger: 0.2,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen pt-24">
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-in">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Instagram className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Instagram Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              Professional Instagram <span className="text-gradient-gold">Management</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Strategic content planning, posting schedules, and paid advertising campaigns 
              that drive engagement and conversions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 animate-in">
            Our <span className="text-gradient-gold">Services</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: PenTool, title: "Content Creation", desc: "High-quality posts, stories, and reels designed for maximum engagement" },
              { icon: TrendingUp, title: "Strategic Ad Campaigns", desc: "Targeted Instagram ads that convert viewers into customers" },
              { icon: Users, title: "Community Management", desc: "Active engagement with your audience to build loyal followers" },
              { icon: Instagram, title: "Profile Optimization", desc: "Complete profile setup and bio optimization for discoverability" }
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="animate-in border-border hover:border-primary/50 transition-all hover-lift">
                  <CardContent className="p-8 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground">{service.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Grow Your Instagram <span className="text-gradient-gold">Presence</span>
            </h2>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              <Link to="/contact">
                Start Growing Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstagramManagement;

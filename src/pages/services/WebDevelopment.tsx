import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Smartphone, Rocket, Search, ArrowRight } from "lucide-react";
import gsap from "gsap";

const WebDevelopment = () => {
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
            <Code className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold">
              Custom <span className="text-gradient-gold">Web Development</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Responsive websites that drive conversions and user engagement
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Code, title: "Modern Tech Stack", desc: "Built with latest technologies for speed and performance" },
              { icon: Smartphone, title: "Mobile-First Design", desc: "Perfectly responsive across all devices" },
              { icon: Search, title: "SEO Optimized", desc: "Built-in SEO best practices for better rankings" },
              { icon: Rocket, title: "Fast Loading", desc: "Optimized for lightning-fast page speeds" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-8 space-y-4 animate-in hover-lift">
                  <Icon className="w-10 h-10 text-primary" />
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
              Build Your Website <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WebDevelopment;

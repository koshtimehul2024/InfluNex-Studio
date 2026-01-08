import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, Lightbulb, Image, Zap, ArrowRight } from "lucide-react";
import gsap from "gsap";

const ProductPhotography = () => {
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
            <Camera className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold">
              Premium <span className="text-gradient-gold">Product Photography</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              High-quality product photography that showcases your products in the best light
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Lightbulb, title: "Studio Lighting", desc: "Professional lighting setups for perfect product shots" },
              { icon: Image, title: "Multiple Angles", desc: "Capture every detail from various perspectives" },
              { icon: Zap, title: "Fast Turnaround", desc: "Quick delivery without compromising quality" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center space-y-4 animate-in">
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
              Book a Shoot <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ProductPhotography;

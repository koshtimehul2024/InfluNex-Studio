import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import gsap from "gsap";

const ECommerce = () => {
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
            <ShoppingCart className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold">
              E-Commerce <span className="text-gradient-gold">Solutions</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Complete seller services for Amazon, Flipkart, Meesho, and Myntra
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Package, title: "Listing Optimization", desc: "SEO-optimized product listings that convert" },
              { icon: TrendingUp, title: "Inventory Management", desc: "Efficient stock tracking and order fulfillment" },
              { icon: DollarSign, title: "Pricing Strategy", desc: "Competitive pricing and promotional campaigns" },
              { icon: ShoppingCart, title: "Multi-Platform", desc: "Manage sales across all major platforms" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4 animate-in hover-lift">
                  <Icon className="w-10 h-10 text-primary" />
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              Start Selling <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ECommerce;

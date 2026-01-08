import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Instagram,
  Camera,
  ShoppingCart,
  Code,
  Calendar,
  Printer,
  Film,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useInView } from "react-intersection-observer";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Users,
    title: "Influencer Marketing",
    description: "Connect with top influencers to amplify your brand's reach and engagement.",
  },
  {
    icon: Instagram,
    title: "Instagram Management",
    description: "Professional social media management and strategic Instagram ad campaigns.",
  },
  {
    icon: Camera,
    title: "Product Photography",
    description: "High-quality product shoots that showcase your brand in the best light.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Solutions",
    description: "Complete seller services for Amazon, Flipkart, Meesho, and Myntra.",
  },
  {
    icon: Code,
    title: "Website Development",
    description: "Custom, responsive websites that drive conversions and user engagement.",
  },
  {
    icon: Calendar,
    title: "Event Management",
    description: "End-to-end event planning and execution for memorable brand experiences.",
  },
  {
    icon: Printer,
    title: "Printing Services",
    description: "Premium printing for business cards, branding materials, and more.",
  },
  {
    icon: Film,
    title: "Video & Reels Editing",
    description: "Professional video editing to create engaging content for social media.",
  },
];

const ServicesPreview = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView && sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".service-card");
      
      // Subtle entrance animation
      cards.forEach((card, index) => {
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
          },
          delay: index * 0.08,
        });
      });
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="py-28 md:py-36 bg-background">
      <div ref={inViewRef} className="container mx-auto px-6">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Premium <span className="text-gradient-gold">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive solutions to elevate your brand and drive measurable results
            </p>
          </div>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="service-card group bg-card border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 group"
          >
            <Link to="/services">
              Explore All Services
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;

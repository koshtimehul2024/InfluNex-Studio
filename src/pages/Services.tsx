import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
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
  CheckCircle2,
  Wrench,
} from "lucide-react";

type LocalService = {
  icon: any;
  title: string;
  link: string;
  description: string;
  features: string[];
};

type DbService = {
  id: string;
  title: string;
  slug: string | null;
  short_description: string | null;
  long_description: string | null;
  icon: string | null;
  banner_image: string | null;
  display_order: number | null;
};

const localServices: LocalService[] = [
  {
    icon: Users,
    title: "Influencer Marketing",
    link: "/services/influencer-marketing",
    description:
      "Connect your brand with verified influencers who resonate with your target audience. We manage end-to-end campaigns from influencer selection to performance tracking.",
    features: [
      "Influencer identification & vetting",
      "Campaign strategy & management",
      "Content approval & monitoring",
      "Performance analytics & reporting",
    ],
  },
  {
    icon: Instagram,
    title: "Instagram Management + Ads",
    link: "/services/instagram-management",
    description:
      "Professional Instagram account management with strategic content planning, posting schedules, and paid advertising campaigns that drive engagement and conversions.",
    features: [
      "Content creation & curation",
      "Story & Reel management",
      "Targeted Instagram ad campaigns",
      "Community engagement & growth",
    ],
  },
  {
    icon: Camera,
    title: "Product Photography",
    link: "/services/product-photography",
    description:
      "High-quality product photography that showcases your products in the best light. Perfect for e-commerce, catalogs, and marketing materials.",
    features: [
      "Studio & lifestyle shoots",
      "Professional lighting & editing",
      "Multiple angles & variations",
      "Fast turnaround times",
    ],
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Seller Services",
    link: "/services/ecommerce",
    description:
      "Complete e-commerce management for Amazon, Flipkart, Meesho, and Myntra. From listing optimization to inventory management and customer service.",
    features: [
      "Product listing & optimization",
      "Inventory & order management",
      "Pricing strategy & promotions",
      "Review management & support",
    ],
  },
  {
    icon: Code,
    title: "Website Development",
    link: "/services/web-development",
    description:
      "Custom, responsive websites built with modern technologies. From landing pages to full e-commerce platforms, we create digital experiences that convert.",
    features: [
      "Custom design & development",
      "Mobile-responsive layouts",
      "SEO optimization",
      "CMS integration & training",
    ],
  },
  {
    icon: Calendar,
    title: "Event Management",
    link: "/services/event-management",
    description:
      "End-to-end event planning and execution for product launches, brand activations, influencer meetups, and corporate events.",
    features: [
      "Event concept & planning",
      "Venue selection & management",
      "Vendor coordination",
      "On-site execution & support",
    ],
  },
  {
    icon: Printer,
    title: "Printing Services",
    link: "/services/printing",
    description:
      "Premium printing for all your branding needs including visiting cards, bill books, brochures, banners, and custom branding materials.",
    features: [
      "Visiting cards & stationery",
      "Marketing collateral",
      "Packaging & labels",
      "Custom branded materials",
    ],
  },
  {
    icon: Film,
    title: "Video & Reels Editing",
    link: "/services/video-editing",
    description:
      "Professional video editing for social media content, promotional videos, and advertisement campaigns. Specializing in Instagram Reels and YouTube content.",
    features: [
      "Social media video editing",
      "Instagram Reels & Stories",
      "YouTube content editing",
      "Motion graphics & effects",
    ],
  },
];

const getIcon = (iconName: string | null) => {
  if (!iconName) return Wrench;
  const Icon = (LucideIcons as any)[iconName];
  return typeof Icon === "function" ? Icon : Wrench;
};

const Services = () => {
  const [dbServices, setDbServices] = useState<DbService[]>([]);

  useEffect(() => {
    const loadDbServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id,title,slug,short_description,long_description,icon,banner_image,display_order")
        .order("display_order", { ascending: true });

      if (!error && data) {
        // Hybrid rule: database services start from position 9 onwards
        const filtered = (data as DbService[]).filter((s) => (s.display_order ?? 0) >= 9);
        setDbServices(filtered);
      }
    };

    loadDbServices();

    // Realtime: show newly added services immediately
    const channel = supabase
      .channel("services_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => {
        loadDbServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const combinedServices = useMemo(() => {
    const mappedDb = dbServices.map((s) => {
      const Icon = getIcon(s.icon);
      return {
        icon: Icon,
        title: s.title,
        link: s.slug ? `/services/${s.slug}` : "/services",
        description: s.short_description || "",
        features: s.long_description
          ? s.long_description
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean)
              .slice(0, 6)
          : [],
        __isDb: true as const,
      };
    });

    return [...localServices, ...mappedDb];
  }, [dbServices]);

  return (
    <>
      <SEO
        title="Our Services"
        description="Premium influencer marketing, Instagram management, content creation, e-commerce solutions, web development, and creative services tailored for modern brands."
        canonicalPath="/services"
      />
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold animate-fade-in">
                Our <span className="text-gradient-gold">Services</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in">
                Premium creative and marketing solutions tailored for modern brands
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 pb-24">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {combinedServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={`${service.title}-${index}`}
                    className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover-lift animate-fade-in h-full flex flex-col"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <CardHeader>
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl text-foreground">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1 flex flex-col">
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">{service.description}</p>

                      {service.features.length > 0 && (
                        <div className="space-y-3 flex-1">
                          {service.features.map((feature, fIndex) => (
                            <div key={fIndex} className="flex items-start space-x-3">
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-primary/30 text-foreground hover:bg-primary/10 group mt-auto"
                      >
                        <Link to={service.link}>
                          Learn More
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Ready to <span className="text-gradient-gold">Get Started?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Let&apos;s discuss how we can elevate your influence and grow your brand
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                <Link to="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Services;

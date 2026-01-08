import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";

interface HomeStat {
  id: string;
  label: string;
  value: string;
  display_order: number;
}

const CTASection = () => {
  const [stats, setStats] = useState<HomeStat[]>([]);

  const loadStats = async () => {
    const { data, error } = await supabase
      .from("home_stats")
      .select("id,label,value,display_order")
      .eq("is_published", true)
      .order("display_order");

    if (!error && data) setStats(data);
  };

  useEffect(() => {
    loadStats();

    // Realtime: reflect admin edits instantly
    const channel = supabase
      .channel("home_stats_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "home_stats" },
        () => {
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const ctaStats = useMemo(() => {
    // Prefer the exact labels if present; otherwise use first 3 published stats.
    const wantedLabels = ["Trusted By", "Satisfaction Rate", "Projects Delivered"];
    const byLabel = wantedLabels
      .map((l) => stats.find((s) => s.label.trim().toLowerCase() === l.toLowerCase()))
      .filter(Boolean) as HomeStat[];

    if (byLabel.length === 3) return byLabel;
    return stats.slice(0, 3);
  }, [stats]);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Ready to Get Started?</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Let&apos;s Build Your Brand
              <br />
              <span className="text-gradient-gold">Together</span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Partner with us to transform your brand vision into reality. Get in touch today and let&apos;s create something
              extraordinary.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group px-8">
                <Link to="/contact">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/30 text-foreground hover:bg-primary/10 px-8"
              >
                <Link to="/influencer-offers">View Influencer Offers</Link>
              </Button>
            </div>

            {/* Trust Badges (dynamic) */}
            {ctaStats.length > 0 && (
              <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                {ctaStats.map((s) => (
                  <div key={s.id} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>
                      {s.label} {s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;

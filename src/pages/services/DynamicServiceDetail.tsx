import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import * as LucideIcons from "lucide-react";

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

const getIcon = (iconName: string | null) => {
  if (!iconName) return Wrench;
  const Icon = (LucideIcons as any)[iconName];
  return typeof Icon === "function" ? Icon : Wrench;
};

export default function DynamicServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<DbService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        navigate("/services", { replace: true });
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select("id,title,slug,short_description,long_description,icon,banner_image,display_order")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        setService(data as DbService);
      } else {
        setService(null);
      }

      setLoading(false);
    };

    load();
  }, [slug, navigate]);

  const Icon = useMemo(() => getIcon(service?.icon ?? null), [service?.icon]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-6 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Service not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This service doesn&apos;t exist (or hasn&apos;t been published yet).
              </p>
              <Button asChild variant="outline">
                <Link to="/services">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={service.title}
        description={service.short_description || `Learn more about ${service.title}.`}
        canonicalPath={service.slug ? `/services/${service.slug}` : "/services"}
      />

      <div className="min-h-screen pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="container mx-auto px-6 relative z-10">
            <Button asChild variant="ghost" className="mb-8 hover:bg-primary/10">
              <Link to="/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Link>
            </Button>

            <div className="max-w-4xl mx-auto space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold">
                  {service.title}
                </h1>
              </div>

              {service.short_description && (
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {service.short_description}
                </p>
              )}

              <div className="pt-4">
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                  <Link to="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 pb-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {service.long_description ? (
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {service.long_description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">Details coming soon.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

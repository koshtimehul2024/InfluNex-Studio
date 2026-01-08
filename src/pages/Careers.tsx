import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { MapPin, Clock, Building2, ArrowRight, Briefcase } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

interface Career {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  job_type: string | null;
  short_description: string | null;
  full_description: string | null;
}

const Careers = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('is_published', true)
        .order('display_order');
      
      if (error) throw error;
      if (data) setCareers(data);
    } catch (error) {
      console.error('Error loading careers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Careers"
        description="Join our team at InfluNex Studio. Explore exciting career opportunities in digital marketing, content creation, and more."
        canonicalPath="/careers"
      />
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-4">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Join Our Team</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold">
                  Careers at <span className="text-gradient-gold">InfluNex</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Be part of a dynamic team that's shaping the future of influencer marketing. 
                  We're always looking for talented individuals who share our passion for creativity and innovation.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="py-16 pb-28">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : careers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">No Current Openings</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  We don't have any open positions at the moment. Please check back later or follow us on social media for updates.
                </p>
                <Button asChild variant="outline" className="border-primary/30">
                  <Link to="/contact">Get in Touch</Link>
                </Button>
              </div>
            ) : (
              <ScrollReveal stagger staggerDelay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {careers.map((career) => (
                    <Card
                      key={career.id}
                      className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover-lift h-full flex flex-col"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                            {career.title}
                          </CardTitle>
                          {career.job_type && (
                            <Badge variant="outline" className="border-primary/30 text-primary shrink-0">
                              {career.job_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          {career.department && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              <span>{career.department}</span>
                            </div>
                          )}
                          {career.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              <span>{career.location}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        {career.short_description && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                            {career.short_description}
                          </p>
                        )}
                        <Button
                          asChild
                          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 group/btn"
                        >
                          <Link to={`/careers/${career.id}`}>
                            View Details & Apply
                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* Why Join Us Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">
                  Why Join <span className="text-gradient-gold">InfluNex?</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Growth Opportunities",
                      description: "Continuous learning and career advancement in a fast-paced industry",
                    },
                    {
                      title: "Creative Freedom",
                      description: "Work on exciting projects with top brands and influencers",
                    },
                    {
                      title: "Collaborative Culture",
                      description: "Join a supportive team that values innovation and teamwork",
                    },
                    {
                      title: "Work-Life Balance",
                      description: "Flexible working arrangements and a healthy work environment",
                    },
                  ].map((benefit, index) => (
                    <Card key={index} className="border-border bg-card">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
};

export default Careers;
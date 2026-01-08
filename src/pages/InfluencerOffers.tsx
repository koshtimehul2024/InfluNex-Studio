import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Sparkles, Star, ArrowRight } from "lucide-react";

const InfluencerOffers = () => {
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    const { data } = await supabase
      .from('influencer_offers')
      .select('*')
      .order('display_order');
    if (data) setOffers(data);
  };
  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-2 mb-4">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-medium">Exclusive for Influencers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold animate-fade-in">
              Influencer <span className="text-gradient-gold">Offers</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed animate-fade-in">
              Premium reels, photos, and editing at special low-cost packages for content creators. 
              Sometimes even free as part of collaboration opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold text-foreground">Collaboration Opportunity</h3>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Have a significant following? Partner with us for brand collaborations and get premium 
                content services completely free! We work with brands looking for authentic influencer 
                partnerships and cover all content creation costs.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-gradient-gold">Package</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Transparent pricing with no hidden fees
            </p>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No Offers Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're updating our packages. Please check back soon or contact us for custom pricing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {offers.map((offer) => (
                <Card
                  key={offer.id}
                  className="relative hover-lift border-border h-full flex flex-col"
                >
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{offer.offer_title}</CardTitle>
                    <div className="text-4xl font-bold text-gradient-gold mb-2">
                      {offer.price}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.offer_description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6 flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {offer.features?.map((feature: string, fIndex: number) => (
                        <li key={fIndex} className="flex items-start space-x-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link to="/contact">
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Why Choose <span className="text-gradient-gold">Our Services?</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Professional Quality",
                  description: "Studio-grade equipment and experienced content creators",
                },
                {
                  title: "Fast Turnaround",
                  description: "Quick delivery without compromising on quality",
                },
                {
                  title: "Flexible Revisions",
                  description: "We work until you're completely satisfied",
                },
                {
                  title: "Brand Collaboration",
                  description: "Access to paid brand deals and partnerships",
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Create <span className="text-gradient-gold">Amazing Content?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get in touch to discuss your requirements and explore collaboration opportunities
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 group"
            >
              <Link to="/contact">
                Apply Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfluencerOffers;

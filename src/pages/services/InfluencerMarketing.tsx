import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, TrendingUp, Target, BarChart3, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const InfluencerMarketing = () => {
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

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increased Reach",
      description: "Tap into influencer audiences to expand brand visibility"
    },
    {
      icon: Target,
      title: "Targeted Campaigns",
      description: "Connect with niche audiences through verified creators"
    },
    {
      icon: BarChart3,
      title: "Measurable Results",
      description: "Track performance metrics and ROI in real-time"
    },
    {
      icon: Users,
      title: "Authentic Engagement",
      description: "Build trust through genuine influencer partnerships"
    }
  ];

  return (
    <div ref={sectionRef} className="min-h-screen pt-24">
      {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-in">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Influencer Marketing</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              Build Influence with <span className="text-gradient-gold">Top Creators</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect your brand with verified influencers who resonate with your target audience. 
              We manage end-to-end campaigns from influencer selection to performance tracking.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 animate-in">
            What We <span className="text-gradient-gold">Offer</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="animate-in border-border hover:border-primary/50 transition-all hover-lift">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl font-bold text-center animate-in">
              Our <span className="text-gradient-gold">Process</span>
            </h2>
            {[
              { step: "01", title: "Discovery & Strategy", desc: "We understand your brand goals and identify the perfect influencer match" },
              { step: "02", title: "Influencer Vetting", desc: "Thorough screening of creators based on engagement, authenticity, and audience fit" },
              { step: "03", title: "Campaign Execution", desc: "Seamless coordination of content creation, approvals, and publishing" },
              { step: "04", title: "Performance Tracking", desc: "Detailed analytics and reporting on reach, engagement, and conversions" }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start animate-in">
                <div className="text-5xl font-bold text-primary/20">{item.step}</div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Launch Your <span className="text-gradient-gold">Campaign?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Let's connect your brand with the right influencers
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              <Link to="/contact">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfluencerMarketing;

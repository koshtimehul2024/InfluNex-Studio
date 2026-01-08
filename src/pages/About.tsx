import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Award, Users } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEO } from "@/components/SEO";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.from(".about-fade-in", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }
  }, []);

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "Our mission is to elevate brands with creativity, innovation, and performance-driven strategies that help businesses grow faster and build stronger influence.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description:
        "To be the leading digital agency that bridges the gap between brands and their audiences through authentic influence.",
    },
    {
      icon: Award,
      title: "Our Values",
      description:
        "Excellence, innovation, integrity, and client success are at the core of everything we do.",
    },
    {
      icon: Users,
      title: "Our Team",
      description:
        "A passionate group of creative professionals dedicated to bringing your brand vision to life.",
    },
  ];

  return (
    <>
      <SEO 
        title="About Us"
        description="Learn about InfluNex Studio - a premium influencer marketing and creative agency dedicated to elevating influence and building powerful brand partnerships."
        canonicalPath="/about"
      />
      <div ref={sectionRef} className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 about-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold">
              About <span className="text-gradient-gold">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We are InfluNex Studio, a premium influencer marketing and creative agency 
              dedicated to elevating influence and building authentic brand partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-8 about-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Who <span className="text-gradient-gold">We Are</span>
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                Founded with a vision to transform influencer marketing, InfluNex Studio has grown 
                into a premium creative agency specializing in influencer partnerships, content creation, 
                social media strategy, and brand amplification.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg mt-6">
                Our team combines strategic insight with creative excellence to deliver campaigns 
                that resonate authentically and drive measurable results. We believe in the 
                power of genuine connections and data-driven strategies to create meaningful 
                relationships between brands and their audiences.
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg mt-6">
                From emerging startups to established brands, we've helped hundreds 
                of companies amplify their message, engage their target audience, and achieve their 
                marketing goals through authentic influencer partnerships. Our expertise spans across multiple 
                industries, giving us unique insights into what resonates in today's dynamic digital landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="about-fade-in bg-card border-border hover:border-primary/50 transition-all duration-500 hover-lift"
                >
                  <CardContent className="p-8 space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12 about-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold">
              Why Choose <span className="text-gradient-gold">InfluNex</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              {[
                {
                  title: "Proven Expertise",
                  description: "Years of experience delivering successful campaigns across industries",
                },
                {
                  title: "Creative Excellence",
                  description: "Award-winning creative team that brings your vision to life",
                },
                {
                  title: "Results-Driven",
                  description: "Data-backed strategies that deliver measurable ROI",
                },
                {
                  title: "End-to-End Service",
                  description: "Complete solutions from strategy to execution and optimization",
                },
                {
                  title: "Influencer Network",
                  description: "Access to premium influencers across all major platforms",
                },
                {
                  title: "Dedicated Support",
                  description: "Personal account management and 24/7 support for our clients",
                },
              ].map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 rounded-full bg-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default About;

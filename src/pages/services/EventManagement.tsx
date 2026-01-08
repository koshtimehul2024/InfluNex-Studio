import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, Sparkles, MapPin, ArrowRight } from "lucide-react";
import gsap from "gsap";

const EventManagement = () => {
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
            <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl md:text-7xl font-bold">
              Professional <span className="text-gradient-gold">Event Management</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              End-to-end event planning for memorable brand experiences
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Sparkles, title: "Creative Concepts", desc: "Unique event themes and creative execution" },
              { icon: MapPin, title: "Venue Selection", desc: "Perfect locations for your brand events" },
              { icon: Users, title: "Guest Management", desc: "Seamless coordination and attendee experience" },
              { icon: Calendar, title: "Full Planning", desc: "From concept to execution, we handle it all" }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-xl p-8 space-y-4 animate-in hover-lift">
                  <Icon className="w-10 h-10 text-primary" />
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
              Plan Your Event <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default EventManagement;

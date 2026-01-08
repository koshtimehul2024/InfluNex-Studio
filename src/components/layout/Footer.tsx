import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import gsap from "gsap";

// Service links with proper routing
const serviceLinks = [
  { name: "Influencer Marketing", path: "/services/influencer-marketing" },
  { name: "Instagram Management", path: "/services/instagram-management" },
  { name: "Product Photography", path: "/services/product-photography" },
  { name: "E-Commerce Services", path: "/services/ecommerce" },
  { name: "Website Development", path: "/services/web-development" },
  { name: "Event Management", path: "/services/event-management" },
];

const Footer = () => {
  const socialIconsRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({
    phone: '+91 98765 43210',
    email: 'hello@influnex.studio',
    address: 'Mumbai, Maharashtra, India',
    footer_text: `© ${currentYear} InfluNex Studio. All rights reserved.`,
    instagram_link: '',
    facebook_link: '',
    linkedin_link: '',
    youtube_link: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data,
          footer_text: `© ${currentYear} InfluNex Studio. All rights reserved.`
        }));
      }
    };
    loadSettings();
    
    // Animate social icons on mount
    if (socialIconsRef.current) {
      const icons = socialIconsRef.current.querySelectorAll('a');
      gsap.from(icons, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: socialIconsRef.current,
          start: "top 95%",
        }
      });
    }
  }, [currentYear]);

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Influencer Offers", path: "/influencer-offers" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="relative bg-card/50 border-t border-border overflow-hidden">
      {/* Gradient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              <span className="text-foreground">Influ</span>
              <span className="text-gradient-gold">Nex</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Influence. Elevated. Your partner in premium influencer marketing and creative excellence.
            </p>
            <div ref={socialIconsRef} className="flex space-x-4">
              {settings.facebook_link && (
                <a href={settings.facebook_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <Facebook size={20} />
                </a>
              )}
              {settings.instagram_link && (
                <a href={settings.instagram_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <Instagram size={20} />
                </a>
              )}
              {settings.linkedin_link && (
                <a href={settings.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <Linkedin size={20} />
                </a>
              )}
              {settings.youtube_link && (
                <a href={settings.youtube_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm text-muted-foreground">
                <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-muted-foreground text-sm">
              {settings.footer_text}
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
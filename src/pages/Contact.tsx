import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { contactFormSchema, ContactFormData, USER_TYPES } from '@/lib/validationSchemas';
import { sanitizeObject } from '@/lib/sanitize';
import { SEO, organizationSchema } from '@/components/SEO';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    phone: '+91 98765 43210',
    email: 'hello@influnex.studio',
    address: 'Mumbai, Maharashtra, India',
    map_embed_url: '',
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      user_type: '',
      message: '',
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from('settings').select('phone, email, address, map_embed_url').single();
      if (data) setSettings(prev => ({ ...prev, ...data }));
    };
    loadSettings();

    // Check cooldown on mount and set up interval
    const checkCooldown = () => {
      const lastSubmissionTime = localStorage.getItem('lastContactSubmission');
      if (lastSubmissionTime) {
        const timeDiff = Date.now() - parseInt(lastSubmissionTime);
        const cooldownMs = 60 * 1000;
        const remainingMs = cooldownMs - timeDiff;
        
        if (remainingMs > 0) {
          setCooldownSeconds(Math.ceil(remainingMs / 1000));
        } else {
          setCooldownSeconds(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (data: ContactFormData) => {
    // Check client-side rate limit first
    const lastSubmissionTime = localStorage.getItem('lastContactSubmission');
    const now = Date.now();
    
    if (lastSubmissionTime) {
      const timeDiff = now - parseInt(lastSubmissionTime);
      const cooldownSeconds = 60;
      const remainingSeconds = Math.ceil((cooldownSeconds * 1000 - timeDiff) / 1000);
      
      if (timeDiff < cooldownSeconds * 1000) {
        toast({
          title: 'Please wait',
          description: `You can submit again in ${remainingSeconds} seconds.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Sanitize all inputs before submitting
      const sanitizedData = sanitizeObject(data);

      // Call edge function for server-side rate limiting
      const { data: responseData, error } = await supabase.functions.invoke('submit-contact', {
        body: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone || null,
          user_type: sanitizedData.user_type,
          message: sanitizedData.message || null,
        },
      });

      // Check for rate limit error (429)
      if (error) {
        if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
          const remainingSeconds = responseData?.remainingSeconds || 60;
          toast({
            variant: 'destructive',
            title: 'Rate limit exceeded',
            description: `Please wait ${remainingSeconds} seconds before submitting again.`,
          });
          return;
        }
        throw error;
      }

      // Set last submission time
      localStorage.setItem('lastContactSubmission', now.toString());

      setShowSuccess(true);
      
      toast({
        title: 'Message Sent!',
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      form.reset();
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with InfluNex Studio. Let's discuss how we can elevate your influence with our premium creative and marketing services."
        schema={organizationSchema}
        canonicalPath="/contact"
      />
      
      <div className="min-h-screen pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        
        <div className="container mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold">
                Get In <span className="text-gradient-gold">Touch</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Let's discuss how we can help elevate your brand. We're here to answer your questions and start your journey.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 pb-28">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
                        <p className="text-muted-foreground">{settings.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                        <a href={`tel:${settings.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {settings.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                        <a href={`mailto:${settings.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {settings.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold text-lg mb-3">Office Hours</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Quick Response</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond within 24 hours. For urgent matters, please call us directly.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
                    <p className="text-muted-foreground">Fill out the form below and we'll get back to you shortly.</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your full name" 
                                  {...field}
                                  className={`input-gold-focus transition-all duration-300 ${fieldState.error ? 'input-shake border-destructive' : ''}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel" 
                                  placeholder="+1 (555) 000-0000" 
                                  {...field}
                                  className={`input-gold-focus transition-all duration-300 ${fieldState.error ? 'input-shake border-destructive' : ''}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="your@email.com" 
                                  {...field}
                                  className={`input-gold-focus transition-all duration-300 ${fieldState.error ? 'input-shake border-destructive' : ''}`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="user_type"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel>You are a *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className={`input-gold-focus ${fieldState.error ? 'border-destructive' : ''}`}>
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {USER_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about your project or inquiry..."
                                className={`min-h-[140px] resize-none input-gold-focus transition-all duration-300 ${fieldState.error ? 'input-shake border-destructive' : ''}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showSuccess && (
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-3 animate-slide-reveal">
                          <CheckCircle className="w-5 h-5 text-primary animate-scale-in" />
                          <p className="text-sm text-foreground">Your message has been sent successfully! We'll get back to you soon.</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        variant="premium"
                        className={`w-full md:w-auto px-8 ${loading ? 'animate-sending' : ''}`}
                        disabled={loading || cooldownSeconds > 0}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : cooldownSeconds > 0 ? (
                          <>Try again in {cooldownSeconds}s</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      {cooldownSeconds > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Please wait {cooldownSeconds} seconds before submitting again.
                        </p>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {settings.map_embed_url ? (
              <div className="aspect-video rounded-2xl overflow-hidden border border-border">
                <iframe
                  src={settings.map_embed_url}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-card border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Map location coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Contact;
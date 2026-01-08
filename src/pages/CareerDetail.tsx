import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Building2, ArrowLeft, Upload, Loader2, CheckCircle, FileText } from "lucide-react";
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

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").max(20).optional().or(z.literal("")),
  message: z.string().max(2000, "Message must be less than 2000 characters").optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const CareerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useEffect(() => {
    if (id) {
      loadCareer();
    }
  }, [id]);

  const loadCareer = async () => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        navigate('/careers');
        return;
      }
      setCareer(data);
    } catch (error) {
      console.error('Error loading career:', error);
      navigate('/careers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF and DOC/DOCX files are allowed.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!career) return;

    try {
      setSubmitting(true);

      let resumeUrl = '';
      let resumePath = '';

      // Upload resume if provided
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `applications/${career.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);

        resumeUrl = urlData.publicUrl;
        resumePath = filePath;
      }

      // Submit application
      const { error } = await supabase.from('career_applications').insert({
        career_id: career.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        resume_url: resumeUrl || null,
        resume_path: resumePath || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying. We'll be in touch soon.",
      });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  if (!career) {
    return null;
  }

  return (
    <>
      <SEO 
        title={`${career.title} - Careers`}
        description={career.short_description || `Apply for ${career.title} position at InfluNex Studio.`}
        canonicalPath={`/careers/${career.id}`}
      />
      <div className="min-h-screen pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/careers')}
            className="mb-8 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal>
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold">{career.title}</h1>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    {career.job_type && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {career.job_type}
                      </Badge>
                    )}
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
                </div>
              </ScrollReveal>

              {career.full_description && (
                <ScrollReveal>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {career.full_description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )}
            </div>

            {/* Application Form */}
            <div className="lg:col-span-1">
              <ScrollReveal>
                <Card className="border-primary/20 sticky top-28">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {submitted ? "Application Submitted" : "Apply Now"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submitted ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">Thank You!</h3>
                        <p className="text-muted-foreground text-sm">
                          Your application has been submitted successfully. We'll review it and get back to you soon.
                        </p>
                        <Button asChild variant="outline" className="w-full mt-4">
                          <Link to="/careers">View Other Positions</Link>
                        </Button>
                      </div>
                    ) : (
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 98765 43210" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-2">
                            <FormLabel>Resume</FormLabel>
                            <div className="space-y-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full justify-start"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {resumeFile ? resumeFile.name : "Upload Resume"}
                              </Button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              {resumeFile && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <FileText className="w-4 h-4" />
                                  <span className="truncate">{resumeFile.name}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setResumeFile(null)}
                                    className="h-auto p-1 text-destructive hover:text-destructive"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                PDF, DOC, DOCX • Max 5MB
                              </p>
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cover Letter / Message</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us why you'd be a great fit for this role..." 
                                    rows={4}
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Application"
                            )}
                          </Button>
                        </form>
                      </Form>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerDetail;
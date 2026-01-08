-- =============================================
-- HOME PAGE ADMIN EDITABLE SECTIONS
-- =============================================

-- Home Logos table (Customer / Brand logos)
CREATE TABLE public.home_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  image_path TEXT,
  type TEXT NOT NULL DEFAULT 'customer' CHECK (type IN ('customer', 'brand')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Home Stats table (Projects, Clients, etc.)
CREATE TABLE public.home_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for home_logos
CREATE POLICY "Anyone can view published logos" 
ON public.home_logos 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage logos" 
ON public.home_logos 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for home_stats
CREATE POLICY "Anyone can view published stats" 
ON public.home_stats 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage stats" 
ON public.home_stats 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- CAREERS MODULE
-- =============================================

-- Careers table (Job listings)
CREATE TABLE public.careers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  job_type TEXT DEFAULT 'Full-time',
  short_description TEXT,
  full_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Career Applications table
CREATE TABLE public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_id UUID REFERENCES public.careers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  resume_url TEXT,
  resume_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for careers
CREATE POLICY "Anyone can view published careers" 
ON public.careers 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage careers" 
ON public.careers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for career_applications
CREATE POLICY "Anyone can submit applications" 
ON public.career_applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all applications" 
ON public.career_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications" 
ON public.career_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete applications" 
ON public.career_applications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_home_logos_updated_at
BEFORE UPDATE ON public.home_logos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_home_stats_updated_at
BEFORE UPDATE ON public.home_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_careers_updated_at
BEFORE UPDATE ON public.careers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_home_logos_type_published ON public.home_logos(type, is_published);
CREATE INDEX idx_home_logos_display_order ON public.home_logos(display_order);
CREATE INDEX idx_home_stats_published ON public.home_stats(is_published);
CREATE INDEX idx_careers_published ON public.careers(is_published);
CREATE INDEX idx_career_applications_career_id ON public.career_applications(career_id);
CREATE INDEX idx_career_applications_status ON public.career_applications(status);

-- =============================================
-- STORAGE BUCKET FOR RESUMES
-- =============================================

-- Create resumes storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
CREATE POLICY "Anyone can upload resumes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Admins can view resumes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resumes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'resumes' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- INSERT DEFAULT STATS
-- =============================================

INSERT INTO public.home_stats (label, value, display_order, is_published) VALUES
('Projects Completed', '500+', 1, true),
('Happy Clients', '200+', 2, true),
('Influencers', '50+', 3, true),
('Satisfaction Rate', '98%', 4, true);

-- Create logos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for logos bucket
CREATE POLICY "Anyone can view logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'));
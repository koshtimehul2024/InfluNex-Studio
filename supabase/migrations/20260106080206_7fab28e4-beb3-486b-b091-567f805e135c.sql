-- ==========================================================================
-- INFLUNEX SECURITY HARDENING MIGRATION
-- 1. Centralized Media Library table
-- 2. Storage bucket policies for secure upload
-- 3. Additional RLS enhancements
-- ==========================================================================

-- ============= 1. CENTRALIZED MEDIA TABLE =============
-- Store metadata about all uploaded media files
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT,
  path TEXT NOT NULL,
  bucket TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bucket, path)
);

-- Enable RLS on media_library
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Admins can manage all media
CREATE POLICY "Admins can manage media"
ON public.media_library
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view media metadata (for public images)
CREATE POLICY "Anyone can view media"
ON public.media_library
FOR SELECT
USING (true);

-- ============= 2. ADD ip_address UNIQUE CONSTRAINT =============
-- Fix for rate limiting upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contact_rate_limit_ip_address_key'
  ) THEN
    ALTER TABLE public.contact_rate_limit 
    ADD CONSTRAINT contact_rate_limit_ip_address_key UNIQUE (ip_address);
  END IF;
END $$;

-- Enable RLS on contact_rate_limit (currently missing policies)
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- Only edge functions with service role can access rate limit table
-- No direct client access needed

-- ============= 3. STORAGE BUCKET POLICIES =============
-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('portfolio', 'portfolio', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('logos', 'logos', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('resumes', 'resumes', false, 5242880, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============= 4. STORAGE RLS POLICIES =============
-- Portfolio bucket policies
DROP POLICY IF EXISTS "Anyone can view portfolio images" ON storage.objects;
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Admins can upload portfolio images" ON storage.objects;
CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can update portfolio images" ON storage.objects;
CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete portfolio images" ON storage.objects;
CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Logos bucket policies
DROP POLICY IF EXISTS "Anyone can view logo images" ON storage.objects;
CREATE POLICY "Anyone can view logo images"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Admins can upload logo images" ON storage.objects;
CREATE POLICY "Admins can upload logo images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can update logo images" ON storage.objects;
CREATE POLICY "Admins can update logo images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Admins can delete logo images" ON storage.objects;
CREATE POLICY "Admins can delete logo images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Resumes bucket policies (private - only admins can view)
DROP POLICY IF EXISTS "Admins can view resumes" ON storage.objects;
CREATE POLICY "Admins can view resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Admins can delete resumes" ON storage.objects;
CREATE POLICY "Admins can delete resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============= 5. UPDATE TIMESTAMP TRIGGER =============
-- Create trigger for media_library updated_at
CREATE OR REPLACE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
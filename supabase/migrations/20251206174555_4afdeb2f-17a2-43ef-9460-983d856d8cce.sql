-- =====================================================================
-- 1. FIX RATE LIMITING TABLE - Remove public access, only edge function uses it
-- =====================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can manage their own rate limit" ON public.contact_rate_limit;

-- Rate limit table should only be accessed by service role (edge functions)
-- No user should have direct access to this table
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS

-- =====================================================================
-- 2. ADD STORAGE BUCKET POLICIES FOR PORTFOLIO
-- =====================================================================

-- Allow public read access to portfolio images
CREATE POLICY "Public can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Only admins can upload portfolio images
CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can update portfolio images
CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Only admins can delete portfolio images
CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- =====================================================================
-- 3. VERIFY INQUIRIES TABLE HAS PROPER RLS (already exists but confirm)
-- =====================================================================

-- Add DELETE policy for admins (was missing)
CREATE POLICY "Admins can delete inquiries"
ON public.inquiries FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
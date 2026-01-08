-- Create table for contact form rate limiting
CREATE TABLE IF NOT EXISTS public.contact_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  last_submission_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(ip_address)
);

-- Enable RLS
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check and update their own rate limit (by IP)
CREATE POLICY "Anyone can manage their own rate limit"
ON public.contact_rate_limit
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_ip ON public.contact_rate_limit(ip_address);
CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_timestamp ON public.contact_rate_limit(last_submission_at);
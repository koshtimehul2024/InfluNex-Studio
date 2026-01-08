-- Add map configuration fields to settings table
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS map_latitude text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS map_longitude text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS map_embed_url text DEFAULT NULL;

-- Add user_type field to inquiries table for contact form enhancement
ALTER TABLE public.inquiries
ADD COLUMN IF NOT EXISTS user_type text DEFAULT NULL;

-- Update the message validation to be optional (nullable is already true, but making explicit)
COMMENT ON COLUMN public.inquiries.message IS 'Optional message from contact form';
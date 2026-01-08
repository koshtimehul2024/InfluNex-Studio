-- Add image_path column to portfolio table for storage management
ALTER TABLE public.portfolio ADD COLUMN IF NOT EXISTS image_path text;
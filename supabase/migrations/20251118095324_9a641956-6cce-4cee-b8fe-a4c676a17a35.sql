-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create settings table (single row)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name TEXT DEFAULT 'BrandBooste Agency',
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  hero_heading TEXT DEFAULT 'We Build Influence. We Build Brands.',
  hero_subheading TEXT DEFAULT 'Premium digital marketing and creative services',
  about_mission TEXT DEFAULT 'Our mission is to elevate brands with creativity, innovation, and performance-driven strategies that help businesses grow faster and build stronger influence.',
  footer_text TEXT DEFAULT '© 2025 BrandBooste Agency. All rights reserved.',
  instagram_link TEXT,
  youtube_link TEXT,
  facebook_link TEXT,
  linkedin_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.settings (
  agency_name, 
  phone, 
  email, 
  whatsapp,
  address,
  instagram_link,
  facebook_link,
  linkedin_link
) VALUES (
  'BrandBooste Agency',
  '+91 98765 43210',
  'hello@brandbooste.com',
  '+91 98765 43210',
  'Mumbai, Maharashtra, India',
  'https://instagram.com/brandbooste',
  'https://facebook.com/brandbooste',
  'https://linkedin.com/company/brandbooste'
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  icon TEXT,
  banner_image TEXT,
  slug TEXT UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default services
INSERT INTO public.services (title, short_description, slug, display_order) VALUES
('Influencer Marketing', 'Connect with the right influencers to amplify your brand', 'influencer-marketing', 1),
('Instagram Management', 'Complete Instagram profile management and ad campaigns', 'instagram-management', 2),
('Product Photography', 'Professional product photography that showcases your brand', 'product-photography', 3),
('E-Commerce Solutions', 'Complete seller services for Amazon, Flipkart, Meesho, Myntra', 'ecommerce', 4),
('Web Development', 'Custom websites that drive conversions', 'web-development', 5),
('Event Management', 'End-to-end event planning and execution', 'event-management', 6),
('Printing Services', 'Professional printing for all your branding needs', 'printing', 7),
('Video Editing', 'Engaging video content for social media and marketing', 'video-editing', 8);

-- Create portfolio table
CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio"
  ON public.portfolio FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage portfolio"
  ON public.portfolio FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create influencer_offers table
CREATE TABLE public.influencer_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_title TEXT NOT NULL,
  offer_description TEXT,
  price TEXT,
  features TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.influencer_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view offers"
  ON public.influencer_offers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage offers"
  ON public.influencer_offers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default offers
INSERT INTO public.influencer_offers (offer_title, offer_description, price, features, display_order) VALUES
('Starter Package', 'Perfect for new influencers', '₹4,999', ARRAY['3 Premium Reels', '5 Product Photos', 'Basic Editing'], 1),
('Growth Package', 'For growing creators', '₹9,999', ARRAY['8 Premium Reels', '15 Product Photos', 'Advanced Editing', 'Story Templates'], 2),
('Pro Package', 'For established influencers', '₹19,999', ARRAY['20 Premium Reels', 'Unlimited Photos', 'Premium Editing', 'Content Strategy', 'Priority Support'], 3);

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON public.inquiries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_influencer_offers_updated_at
  BEFORE UPDATE ON public.influencer_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
import { z } from 'zod';

// User types for contact form
export const USER_TYPES = [
  'Business Owner',
  'Influencer',
  'Agency',
  'Freelancer',
  'Other',
] as const;

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  phone: z.string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(20, 'Phone number must not exceed 20 characters')
    .regex(/^[+\d\s()-]+$/, 'Phone number can only contain digits, +, -, (), and spaces')
    .optional()
    .or(z.literal('')),
  user_type: z.string()
    .trim()
    .min(1, 'Please select who you are')
    .max(50, 'User type must not exceed 50 characters'),
  message: z.string()
    .trim()
    .max(2000, 'Message must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

// Auth Schema
export const authSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
});

// Strong Admin Password Schema
export const adminPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 
    'Password must contain uppercase, lowercase, number, and special character');

// Admin Auth Schema
export const adminAuthSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: adminPasswordSchema,
});

// Services Schema
export const serviceSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  slug: z.string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),
  short_description: z.string()
    .trim()
    .min(10, 'Short description must be at least 10 characters')
    .max(300, 'Short description must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
  long_description: z.string()
    .trim()
    .min(20, 'Long description must be at least 20 characters')
    .max(5000, 'Long description must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  icon: z.string()
    .trim()
    .url('Icon must be a valid URL')
    .max(500, 'Icon URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  banner_image: z.string()
    .trim()
    .url('Banner image must be a valid URL')
    .max(500, 'Banner image URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  display_order: z.number()
    .int('Display order must be a whole number')
    .min(0, 'Display order must be 0 or greater')
    .optional(),
});

// Portfolio Schema
export const portfolioSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  category: z.string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters'),
  image_url: z.string()
    .trim()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  description: z.string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

// Offers Schema
export const offerSchema = z.object({
  offer_title: z.string()
    .trim()
    .min(3, 'Offer title must be at least 3 characters')
    .max(100, 'Offer title must not exceed 100 characters'),
  offer_description: z.string()
    .trim()
    .min(10, 'Offer description must be at least 10 characters')
    .max(5000, 'Offer description must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  price: z.string()
    .trim()
    .max(50, 'Price must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  features: z.array(z.string().trim().max(500, 'Feature must not exceed 500 characters')).optional(),
  display_order: z.number()
    .int('Display order must be a whole number')
    .min(0, 'Display order must be 0 or greater')
    .optional(),
});

// Settings Schema
export const settingsSchema = z.object({
  agency_name: z.string()
    .trim()
    .max(150, 'Agency name must not exceed 150 characters')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .max(20, 'Phone must not exceed 20 characters')
    .regex(/^[+\d\s()-]*$/, 'Phone can only contain digits, +, -, (), and spaces')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  whatsapp: z.string()
    .trim()
    .max(20, 'WhatsApp must not exceed 20 characters')
    .regex(/^[+\d\s()-]*$/, 'WhatsApp can only contain digits, +, -, (), and spaces')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .trim()
    .max(500, 'Address must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  hero_heading: z.string()
    .trim()
    .max(200, 'Hero heading must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  hero_subheading: z.string()
    .trim()
    .max(300, 'Hero subheading must not exceed 300 characters')
    .optional()
    .or(z.literal('')),
  about_mission: z.string()
    .trim()
    .max(2000, 'About mission must not exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  footer_text: z.string()
    .trim()
    .max(500, 'Footer text must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  instagram_link: z.string()
    .trim()
    .url('Instagram link must be a valid URL')
    .max(500, 'Instagram link must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  youtube_link: z.string()
    .trim()
    .url('YouTube link must be a valid URL')
    .max(500, 'YouTube link must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  facebook_link: z.string()
    .trim()
    .url('Facebook link must be a valid URL')
    .max(500, 'Facebook link must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  linkedin_link: z.string()
    .trim()
    .url('LinkedIn link must be a valid URL')
    .max(500, 'LinkedIn link must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  map_latitude: z.string()
    .trim()
    .max(50, 'Latitude must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  map_longitude: z.string()
    .trim()
    .max(50, 'Longitude must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  map_embed_url: z.string()
    .trim()
    .max(1000, 'Map embed URL must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type AdminAuthFormData = z.infer<typeof adminAuthSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type PortfolioFormData = z.infer<typeof portfolioSchema>;
export type OfferFormData = z.infer<typeof offerSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  schema?: object;
  canonicalPath?: string;
}

export function SEO({ 
  title = "InfluNex Studio - Premium Influencer Marketing & Creative Agency",
  description = "Influence. Elevated. Premium influencer marketing, Instagram management, product photography, e-commerce services, and creative solutions for modern brands.",
  image = "https://influnex.studio/og-image.jpg",
  type = "website",
  schema,
  canonicalPath = ""
}: SEOProps) {
  const fullTitle = title.includes('InfluNex') ? title : `${title} | InfluNex Studio`;
  const baseUrl = "https://influnex.studio";
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="InfluNex Studio" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@InfluNexStudio" />
      <meta name="twitter:creator" content="@InfluNexStudio" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "InfluNex Studio",
  "description": "Premium influencer marketing and creative agency specializing in influencer partnerships, social media management, and premium content creation.",
  "url": "https://influnex.studio",
  "logo": "https://influnex.studio/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-98765-43210",
    "contactType": "customer service",
    "email": "hello@influnex.studio",
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://instagram.com/influnexstudio",
    "https://facebook.com/influnexstudio",
    "https://linkedin.com/company/influnexstudio"
  ]
};

// Service Schema Generator
export const createServiceSchema = (serviceName: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": serviceName,
  "provider": {
    "@type": "Organization",
    "name": "InfluNex Studio"
  },
  "description": description,
  "areaServed": {
    "@type": "Country",
    "name": "India"
  }
});

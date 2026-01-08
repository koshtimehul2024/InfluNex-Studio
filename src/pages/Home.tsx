import Hero from "@/components/home/Hero";
import ServicesPreview from "@/components/home/ServicesPreview";
import CTASection from "@/components/home/CTASection";
import HomeLogos from "@/components/home/HomeLogos";
import { SEO, organizationSchema } from "@/components/SEO";

const Home = () => {
  return (
    <>
      <SEO 
        schema={organizationSchema} 
        canonicalPath="/"
      />
      <div className="min-h-screen">
        <Hero />
        <ServicesPreview />
        <HomeLogos type="customer" title="Trusted by Leading Brands" />
        <HomeLogos type="brand" title="Our Brand Partners" />
        <CTASection />
      </div>
    </>
  );
};

export default Home;
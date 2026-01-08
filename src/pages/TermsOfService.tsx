import { SEO } from "@/components/SEO";

const TermsOfService = () => {
  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Terms of Service for InfluNex Studio - Read our terms and conditions for using our services."
        canonicalPath="/terms-of-service"
      />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Terms of <span className="text-gradient-gold">Service</span>
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <p className="text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the services provided by InfluNex Studio ("we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Services</h2>
              <p>
                InfluNex Studio provides digital marketing, influencer marketing, social media management, content creation, and related creative services. The specific scope of services will be outlined in individual project agreements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Client Responsibilities</h2>
              <p>
                As a client, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Respond to requests for approvals in a timely manner</li>
                <li>Make payments according to agreed-upon terms</li>
                <li>Provide necessary access to accounts and materials</li>
                <li>Ensure you have rights to any content you provide</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Payment Terms</h2>
              <p>
                Payment terms will be specified in individual project proposals or contracts. Unless otherwise stated:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A deposit may be required before work begins</li>
                <li>Invoices are due within 15 days of issue</li>
                <li>Late payments may incur additional charges</li>
                <li>All prices are in INR unless otherwise specified</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property</h2>
              <p>
                Upon full payment, clients receive rights to deliverables as specified in the project agreement. InfluNex Studio retains the right to showcase work in portfolios and marketing materials unless otherwise agreed.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Confidentiality</h2>
              <p>
                Both parties agree to maintain confidentiality of proprietary information shared during the course of the engagement. This obligation survives termination of the agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, InfluNex Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Termination</h2>
              <p>
                Either party may terminate a project agreement with written notice. Upon termination, you are responsible for payment for all work completed up to the termination date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Modifications</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to our website. Continued use of our services constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ahmedabad, Gujarat.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-foreground">
                Email: hello@influnex.studio<br />
                Phone: +91 99097 10770
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;

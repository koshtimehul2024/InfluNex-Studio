import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { usePageTransition } from "./hooks/usePageTransition";
import { AuthProvider } from "./contexts/AuthContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import { useLoader } from "./contexts/LoaderContext";
import { useRouteLoader } from "./hooks/useRouteLoader";
import { InfluNexLoader } from "./components/InfluNexLoader";
import { AdminLayout } from "./components/admin/AdminLayout";
import { MagneticCursor } from "./components/MagneticCursor";
import { useLenisScroll } from "./hooks/useLenisScroll";
import { WhatsAppWidget } from "./components/WhatsAppWidget";
import { lazy, Suspense } from "react";

// Lazy load pages for performance
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const InfluencerOffers = lazy(() => import("./pages/InfluencerOffers"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
import Auth from "./pages/Auth";
import AdminLogin from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import ServicesManager from "./pages/admin/ServicesManager";
import PortfolioManager from "./pages/admin/PortfolioManager";
import OffersManager from "./pages/admin/OffersManager";
import InquiriesManager from "./pages/admin/InquiriesManager";
import AdminManagement from "./pages/admin/AdminManagement";
import ChangePassword from "./pages/admin/ChangePassword";
import SecurityLogs from "./pages/admin/SecurityLogs";
import HomeContentManager from "./pages/admin/HomeContentManager";
import CareersManager from "./pages/admin/CareersManager";
import ApplicationsManager from "./pages/admin/ApplicationsManager";
import InfluencerMarketing from "./pages/services/InfluencerMarketing";
import InstagramManagement from "./pages/services/InstagramManagement";
import ProductPhotography from "./pages/services/ProductPhotography";
import ECommerce from "./pages/services/ECommerce";
import WebDevelopment from "./pages/services/WebDevelopment";
import EventManagement from "./pages/services/EventManagement";
import PrintingServices from "./pages/services/PrintingServices";
import VideoEditing from "./pages/services/VideoEditing";
import DynamicServiceDetail from "./pages/services/DynamicServiceDetail";

// Lazy load careers pages
const Careers = lazy(() => import("./pages/Careers"));
const CareerDetail = lazy(() => import("./pages/CareerDetail"));

const queryClient = new QueryClient();

const AppContent = () => {
  useSmoothScroll();
  useRouteLoader();
  usePageTransition();
  useLenisScroll();
  const { isLoading } = useLoader();
  
  return (
    <>
      <InfluNexLoader isLoading={isLoading} />
      <MagneticCursor />
      <WhatsAppWidget />
      <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-primary text-xl font-semibold">Loading...</div>
        </div>
      }>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Admin Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="home-content" element={<HomeContentManager />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="portfolio" element={<PortfolioManager />} />
          <Route path="offers" element={<OffersManager />} />
          <Route path="careers" element={<CareersManager />} />
          <Route path="applications" element={<ApplicationsManager />} />
          <Route path="inquiries" element={<InquiriesManager />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="security-logs" element={<SecurityLogs />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/about" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <About />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Services />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/influencer-marketing" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <InfluencerMarketing />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/instagram-management" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <InstagramManagement />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/product-photography" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ProductPhotography />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/ecommerce" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ECommerce />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/web-development" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <WebDevelopment />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/event-management" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <EventManagement />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/printing" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <PrintingServices />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/services/video-editing" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <VideoEditing />
            </main>
            <Footer />
          </div>
        } />
        {/* Dynamic DB-backed service detail (kept AFTER all static service routes) */}
        <Route path="/services/:slug" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <DynamicServiceDetail />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/portfolio" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Portfolio />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/influencer-offers" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <InfluencerOffers />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Contact />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/privacy-policy" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <PrivacyPolicy />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/terms-of-service" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <TermsOfService />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/careers" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Careers />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/careers/:id" element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <CareerDetail />
            </main>
            <Footer />
          </div>
        } />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </AuthProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LoaderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LoaderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

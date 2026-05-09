import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAnalyticsInjection } from "@/hooks/useAnalyticsInjection";
import { SEO } from "@/components/SEO";
import GlobalSupport from "@/components/GlobalSupport";
import { lazy, Suspense } from "react";

// Eagerly loaded (most-visited / lightweight)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import LoginPage from "./pages/LoginPage";

// --- Lazy-loaded routes ---------------------------------------------------
// Admin
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAISupport = lazy(() => import("./pages/admin/AdminAISupport"));
const AdminServicePackages = lazy(() => import("./pages/admin/AdminServicePackages"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminFooterEditor = lazy(() => import("./pages/admin/AdminFooterEditor"));
const AdminClientDocuments = lazy(() => import("./pages/admin/AdminClientDocuments"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminPortfolio })));
const AdminBlog = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminBlog })));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminTestimonials })));
const AdminTeam = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminTeam })));
const AdminClients = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminClients })));
const AdminPricing = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminPricing })));
const AdminFAQ = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminFAQ })));
const AdminCareers = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminCareers })));
const AdminPopularSearches = lazy(() => import("./pages/admin/AdminPopularSearches"));

// Auth / user pages
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Public pages
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const CareersPage = lazy(() => import("./pages/CareersPage"));
const GetQuotePage = lazy(() => import("./pages/GetQuotePage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));
const DeliveryPolicyPage = lazy(() => import("./pages/DeliveryPolicyPage"));
const ComplaintPolicyPage = lazy(() => import("./pages/ComplaintPolicyPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));


const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageFallback />;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const AdminRoutes = () => (
  <ProtectedRoute>
    <AdminLayout>
      <Routes>
        <Route path="" element={<AdminDashboard />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="service-packages" element={<AdminServicePackages />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="careers" element={<AdminCareers />} />
        <Route path="ai-support" element={<AdminAISupport />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="seo" element={<AdminSEO />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="footer" element={<AdminFooterEditor />} />
        <Route path="client-docs" element={<AdminClientDocuments />} />
        <Route path="popular-searches" element={<AdminPopularSearches />} />
      </Routes>
    </AdminLayout>
  </ProtectedRoute>
);


// Root component that injects analytics on every page load
const AppWithAnalytics = () => {
  useAnalyticsInjection();
  return (
    <Suspense fallback={<PageFallback />}>
      <SEO />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/get-quote" element={<GetQuotePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/delivery-policy" element={<DeliveryPolicyPage />} />
        <Route path="/complaint-policy" element={<ComplaintPolicyPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GlobalSupport />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <AppWithAnalytics />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

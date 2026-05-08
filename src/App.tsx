import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useAnalyticsInjection } from "@/hooks/useAnalyticsInjection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAISupport from "./pages/admin/AdminAISupport";
import AdminServicePackages from "./pages/admin/AdminServicePackages";
import {
  AdminPortfolio, AdminBlog, AdminTestimonials, AdminTeam,
  AdminClients, AdminPricing, AdminFAQ, AdminCareers
} from "./pages/admin/AdminCrud";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFooterEditor from "./pages/admin/AdminFooterEditor";
import AdminClientDocuments from "./pages/admin/AdminClientDocuments";

// Auth pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

// Public pages
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import PricingPage from "./pages/PricingPage";
import CareersPage from "./pages/CareersPage";
import GetQuotePage from "./pages/GetQuotePage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import DeliveryPolicyPage from "./pages/DeliveryPolicyPage";
import ComplaintPolicyPage from "./pages/ComplaintPolicyPage";
import PaymentPage from "./pages/PaymentPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";

// CMS Admin Pages
import CmsDashboard from "./pages/cms/CmsDashboard";
import ContentListPage from "./pages/cms/ContentListPage";
import ContentEditorPage from "./pages/cms/ContentEditorPage";
import MediaLibraryPage from "./pages/cms/MediaLibraryPage";
import TaxonomyPage from "./pages/cms/TaxonomyPage";
import MenusPage from "./pages/cms/MenusPage";
import SeoManagerPage from "./pages/cms/SeoManagerPage";
import CmsSettingsPage from "./pages/cms/CmsSettingsPage";
import CmsUsersPage from "./pages/cms/CmsUsersPage";
import AuditLogsPage from "./pages/cms/AuditLogsPage";

// CMS Public Pages
import CmsBlogPublicPage from "./pages/cms/CmsBlogPublicPage";
import PublicContentPage from "./pages/cms/PublicContentPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
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
        <Route path="users" element={<AdminUsers />} />
        <Route path="footer" element={<AdminFooterEditor />} />
        <Route path="client-docs" element={<AdminClientDocuments />} />
      </Routes>
    </AdminLayout>
  </ProtectedRoute>
);

const CmsRoutes = () => (
  <ProtectedRoute>
    <Routes>
      <Route path="" element={<CmsDashboard />} />
      <Route path="posts" element={<ContentListPage type="post" />} />
      <Route path="posts/:id" element={<ContentEditorPage type="post" />} />
      <Route path="pages" element={<ContentListPage type="page" />} />
      <Route path="pages/:id" element={<ContentEditorPage type="page" />} />
      <Route path="media" element={<MediaLibraryPage />} />
      <Route path="categories" element={<TaxonomyPage taxonomySlug="category" />} />
      <Route path="tags" element={<TaxonomyPage taxonomySlug="tag" />} />
      <Route path="menus" element={<MenusPage />} />
      <Route path="seo" element={<SeoManagerPage />} />
      <Route path="settings" element={<CmsSettingsPage />} />
      <Route path="users" element={<CmsUsersPage />} />
      <Route path="audit" element={<AuditLogsPage />} />
    </Routes>
  </ProtectedRoute>
);

// Root component that injects analytics on every page load
const AppWithAnalytics = () => {
  useAnalyticsInjection();
  return (
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
      {/* CMS Public Routes */}
      <Route path="/cms-blog" element={<CmsBlogPublicPage />} />
      <Route path="/post/:slug" element={<PublicContentPage type="post" />} />
      <Route path="/page/:slug" element={<PublicContentPage type="page" />} />
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      {/* CMS Routes */}
      <Route path="/cms/*" element={<CmsRoutes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppWithAnalytics />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

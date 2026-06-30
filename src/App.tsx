import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { canAccess, type AdminSection } from "@/lib/admin-permissions";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAnalyticsInjection } from "@/hooks/useAnalyticsInjection";
import { useApplyCopyProtection } from "@/hooks/useCopyProtection";
import { SEO } from "@/components/SEO";
import { AutoStructuredData } from "@/components/AutoStructuredData";

import GlobalSupport from "@/components/GlobalSupport";
import WelcomePopup from "@/components/WelcomePopup";
import ThemeAppearanceProvider from "@/components/ThemeAppearanceProvider";
import SiteBackground from "@/components/SiteBackground";
import { useAdminGlobals } from "@/hooks/useAdminGlobals";
import { lazy, Suspense } from "react";

// Eagerly loaded (most-visited / lightweight)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// --- Lazy-loaded routes ---------------------------------------------------
// Admin

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminRefunds = lazy(() => import("./pages/admin/AdminRefunds"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAISupport = lazy(() => import("./pages/admin/AdminAISupport"));
const AdminServicePackages = lazy(() => import("./pages/admin/AdminServicePackages"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminBkashPGW = lazy(() => import("./pages/admin/AdminBkashPGW"));
const AdminWallets = lazy(() => import("./pages/admin/AdminWallets"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminFooterEditor = lazy(() => import("./pages/admin/AdminFooterEditor"));
const AdminBanners = lazy(() => import("./pages/admin/AdminBanners"));
const AdminWelcomePopups = lazy(() => import("./pages/admin/AdminWelcomePopups"));
const AdminWebsiteCms = lazy(() => import("./pages/admin/AdminWebsiteCms"));
const AdminClientDocuments = lazy(() => import("./pages/admin/AdminClientDocuments"));
const AdminSEO = lazy(() => import("./pages/admin/AdminSEO"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminPortfolio })));
const AdminBlog = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminBlog })));
const AdminBlogCategories = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminBlogCategories })));
const AdminBlogManagement = lazy(() => import("./pages/admin/AdminBlogManagement"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminSEOPanel = lazy(() => import("./pages/admin/AdminSEOPanel"));
const AdminEmailSystem = lazy(() => import("./pages/admin/AdminEmailSystem"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminTestimonials })));
const AdminTeam = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminTeam })));
const AdminClients = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminClients })));
const AdminPricing = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminPricing })));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFaqManager"));
const AdminTechDetails = lazy(() => import("./pages/admin/AdminTechDetails"));
const AdminCareers = lazy(() => import("./pages/admin/AdminCrud").then(m => ({ default: m.AdminCareers })));
const AdminPopularSearches = lazy(() => import("./pages/admin/AdminPopularSearches"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminRedirects = lazy(() => import("./pages/admin/AdminRedirects"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminEmailCampaigns = lazy(() => import("./pages/admin/AdminEmailCampaigns"));
const AdminAIWriter = lazy(() => import("./pages/admin/AdminAIWriter"));
const AdminActivityLog = lazy(() => import("./pages/admin/AdminActivityLog"));
const AdminSitemap = lazy(() => import("./pages/admin/AdminSitemap"));
const AdminSchemaBuilder = lazy(() => import("./pages/admin/AdminSchemaBuilder"));
const AdminSEOTools = lazy(() => import("./pages/admin/AdminSEOTools"));
const AdminRankingSetup = lazy(() => import("./pages/admin/AdminRankingSetup"));

const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminNotices = lazy(() => import("./pages/admin/AdminNotices"));
const AdminExpenses = lazy(() => import("./pages/admin/AdminExpenses"));
const AdminQuotations = lazy(() => import("./pages/admin/AdminQuotations"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter"));
const AdminKnowledgeBase = lazy(() => import("./pages/admin/AdminKnowledgeBase"));
const AdminCustomOrder = lazy(() => import("./pages/admin/AdminCustomOrder"));
const AdminNotificationCenter = lazy(() => import("./pages/admin/AdminNotificationCenter"));
const AdminKpiTracker = lazy(() => import("./pages/admin/AdminKpiTracker"));
const AdminTaskBoard = lazy(() => import("./pages/admin/AdminTaskBoard"));
const AdminBackupCenter = lazy(() => import("./pages/admin/AdminBackupCenter"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminBrands = lazy(() => import("./pages/admin/AdminBrands"));
const AdminProductTags = lazy(() => import("./pages/admin/AdminProductTags"));
const AdminDigitalFiles = lazy(() => import("./pages/admin/AdminDigitalFiles"));
const AdminLicenseKeys = lazy(() => import("./pages/admin/AdminLicenseKeys"));
const AdminBulkProducts = lazy(() => import("./pages/admin/AdminBulkProducts"));
const AdminSecurityAudit = lazy(() => import("./pages/admin/AdminSecurityAudit"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminStaffManagement = lazy(() => import("./pages/admin/AdminStaffManagement"));
const AdminSecurityCenter = lazy(() => import("./pages/admin/AdminSecurityCenter"));
const AdminBackupMaintenance = lazy(() => import("./pages/admin/AdminBackupMaintenance"));
const AdminAnalyticsHub = lazy(() => import("./pages/admin/AdminAnalyticsHub"));
const AdminSettingsHub = lazy(() => import("./pages/admin/AdminSettingsHub"));
const AdminAdvancedTools = lazy(() => import("./pages/admin/AdminAdvancedTools"));
const AdminOffers = lazy(() => import("./pages/admin/AdminOffers"));
const AdminCopyProtection = lazy(() => import("./pages/admin/AdminCopyProtection"));
const OfferPage = lazy(() => import("./pages/OfferPage"));


// Auth / user pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Public pages
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceCategoryPage = lazy(() => import("./pages/ServiceCategoryPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
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
const BkashCallbackPage = lazy(() => import("./pages/BkashCallbackPage"));
const RefundRequestPage = lazy(() => import("./pages/RefundRequestPage"));
const MyRefundsPage = lazy(() => import("./pages/MyRefundsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const AiSearchPage = lazy(() => import("./pages/AiSearchPage"));
const TechDetailPage = lazy(() => import("./pages/TechDetailPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));


const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lighter, themed loader rendered INSIDE the admin layout so the sidebar/topbar
// stay visible while the page chunk loads — no full-screen black flash.
const AdminPageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground">Loading…</p>
    </div>
  </div>
);


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, roleLoading, isAdmin } = useAuth();
  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/ceo/login" replace />;
  // Wait for the role lookup to finish before deciding — otherwise we briefly
  // see isAdmin=false right after sign-in and bounce the user out.
  if (roleLoading) return <PageFallback />;
  if (!isAdmin) return <Navigate to="/ceo/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ section, children }: { section: AdminSection; children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!canAccess(role, section)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h1 className="text-white text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm max-w-md">
          এই সেকশনটি দেখার অনুমতি আপনার role-এ নেই। আপনার ভূমিকা: <span className="text-purple-400 font-semibold">{role ?? "—"}</span>
        </p>
        <a href="/ceo" className="mt-5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold">
          Dashboard-এ ফিরে যান
        </a>
      </div>
    );
  }
  return <>{children}</>;
};

const AdminRoutes = () => {
  useAdminGlobals();
  return (
  <ProtectedRoute>
    <AdminLayout>
      <Suspense fallback={<AdminPageFallback />}>
      <Routes>
        <Route path="" element={<RoleRoute section="dashboard"><AdminDashboard /></RoleRoute>} />
        <Route path="leads" element={<RoleRoute section="leads"><AdminLeads /></RoleRoute>} />
        <Route path="refunds" element={<RoleRoute section="refunds"><AdminRefunds /></RoleRoute>} />
        <Route path="payments" element={<RoleRoute section="payments"><AdminPayments /></RoleRoute>} />
        <Route path="bkash-pgw" element={<RoleRoute section="payments"><AdminBkashPGW /></RoleRoute>} />
        <Route path="orders" element={<RoleRoute section="orders"><AdminOrders /></RoleRoute>} />
        <Route path="services" element={<RoleRoute section="services"><AdminServices /></RoleRoute>} />
        <Route path="service-packages" element={<RoleRoute section="service-packages"><AdminServicePackages /></RoleRoute>} />
        <Route path="portfolio" element={<RoleRoute section="portfolio"><AdminPortfolio /></RoleRoute>} />
        <Route path="blog" element={<RoleRoute section="blog"><AdminBlog /></RoleRoute>} />
        <Route path="blog-categories" element={<RoleRoute section="blog-categories"><AdminBlogCategories /></RoleRoute>} />
        <Route path="blog-management" element={<RoleRoute section="blog-management"><AdminBlogManagement /></RoleRoute>} />
        <Route path="reviews" element={<RoleRoute section="reviews"><AdminReviews /></RoleRoute>} />
        <Route path="seo-panel" element={<RoleRoute section="seo-panel"><AdminSEOPanel /></RoleRoute>} />
        <Route path="email-system" element={<RoleRoute section="email-system"><AdminEmailSystem /></RoleRoute>} />
        <Route path="media" element={<RoleRoute section="media"><AdminMedia /></RoleRoute>} />
        <Route path="testimonials" element={<RoleRoute section="testimonials"><AdminTestimonials /></RoleRoute>} />
        <Route path="team" element={<RoleRoute section="team"><AdminTeam /></RoleRoute>} />
        <Route path="clients" element={<RoleRoute section="clients"><AdminClients /></RoleRoute>} />
        <Route path="pricing" element={<RoleRoute section="pricing"><AdminPricing /></RoleRoute>} />
        <Route path="faq" element={<RoleRoute section="faq"><AdminFAQ /></RoleRoute>} />
        <Route path="tech-details" element={<RoleRoute section="tech-details"><AdminTechDetails /></RoleRoute>} />
        <Route path="careers" element={<RoleRoute section="careers"><AdminCareers /></RoleRoute>} />
        <Route path="ai-support" element={<RoleRoute section="ai-support"><AdminAISupport /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute section="settings"><AdminSettings /></RoleRoute>} />
        <Route path="seo" element={<RoleRoute section="seo"><AdminSEO /></RoleRoute>} />
        <Route path="users" element={<RoleRoute section="users"><AdminUsers /></RoleRoute>} />
        <Route path="footer" element={<RoleRoute section="footer"><AdminFooterEditor /></RoleRoute>} />
        <Route path="banners" element={<RoleRoute section="banners"><AdminBanners /></RoleRoute>} />
        <Route path="welcome-popups" element={<RoleRoute section="welcome-popups"><AdminWelcomePopups /></RoleRoute>} />
        <Route path="client-docs" element={<RoleRoute section="client-docs"><AdminClientDocuments /></RoleRoute>} />
        <Route path="popular-searches" element={<RoleRoute section="popular-searches"><AdminPopularSearches /></RoleRoute>} />
        <Route path="analytics" element={<RoleRoute section="analytics"><AdminAnalytics /></RoleRoute>} />
        <Route path="activity" element={<RoleRoute section="activity"><AdminActivityLog /></RoleRoute>} />
        <Route path="coupons" element={<RoleRoute section="coupons"><AdminCoupons /></RoleRoute>} />
        <Route path="campaigns" element={<RoleRoute section="campaigns"><AdminEmailCampaigns /></RoleRoute>} />
        <Route path="ai-writer" element={<RoleRoute section="ai-writer"><AdminAIWriter /></RoleRoute>} />
        <Route path="redirects" element={<RoleRoute section="redirects"><AdminRedirects /></RoleRoute>} />
        <Route path="sitemap" element={<RoleRoute section="sitemap"><AdminSitemap /></RoleRoute>} />
        <Route path="schema" element={<RoleRoute section="schema"><AdminSchemaBuilder /></RoleRoute>} />
        <Route path="seo-tools" element={<RoleRoute section="seo-tools"><AdminSEOTools /></RoleRoute>} />
        <Route path="ranking-setup" element={<RoleRoute section="ranking-setup"><AdminRankingSetup /></RoleRoute>} />

        <Route path="products" element={<RoleRoute section="products"><AdminProducts /></RoleRoute>} />
        <Route path="projects" element={<RoleRoute section="projects"><AdminProjects /></RoleRoute>} />
        <Route path="invoices" element={<RoleRoute section="invoices"><AdminInvoices /></RoleRoute>} />
        <Route path="notices" element={<RoleRoute section="notices"><AdminNotices /></RoleRoute>} />
        <Route path="expenses" element={<RoleRoute section="expenses"><AdminExpenses /></RoleRoute>} />
        <Route path="quotations" element={<RoleRoute section="quotations"><AdminQuotations /></RoleRoute>} />
        <Route path="newsletter" element={<RoleRoute section="newsletter"><AdminNewsletter /></RoleRoute>} />
        <Route path="knowledge-base" element={<RoleRoute section="knowledge-base"><AdminKnowledgeBase /></RoleRoute>} />
        <Route path="custom-order" element={<RoleRoute section="custom-order"><AdminCustomOrder /></RoleRoute>} />
        <Route path="wallets" element={<RoleRoute section="wallets"><AdminWallets /></RoleRoute>} />
        <Route path="notifications" element={<RoleRoute section="notifications"><AdminNotificationCenter /></RoleRoute>} />
        <Route path="kpi" element={<RoleRoute section="kpi"><AdminKpiTracker /></RoleRoute>} />
        <Route path="task-board" element={<RoleRoute section="task-board"><AdminTaskBoard /></RoleRoute>} />
        <Route path="backup" element={<RoleRoute section="backup"><AdminBackupCenter /></RoleRoute>} />

        <Route path="backup" element={<RoleRoute section="backup"><AdminBackupCenter /></RoleRoute>} />
        <Route path="categories" element={<RoleRoute section="categories"><AdminCategories /></RoleRoute>} />
        <Route path="brands" element={<RoleRoute section="brands"><AdminBrands /></RoleRoute>} />
        <Route path="product-tags" element={<RoleRoute section="product-tags"><AdminProductTags /></RoleRoute>} />
        <Route path="digital-files" element={<RoleRoute section="digital-files"><AdminDigitalFiles /></RoleRoute>} />
        <Route path="license-keys" element={<RoleRoute section="license-keys"><AdminLicenseKeys /></RoleRoute>} />
        <Route path="bulk-products" element={<RoleRoute section="bulk-products"><AdminBulkProducts /></RoleRoute>} />
        <Route path="security-audit" element={<RoleRoute section="security-audit"><AdminSecurityAudit /></RoleRoute>} />
        <Route path="customers" element={<RoleRoute section="customers"><AdminCustomers /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute section="reports"><AdminReports /></RoleRoute>} />
        <Route path="website-cms" element={<RoleRoute section="website-cms"><AdminWebsiteCms /></RoleRoute>} />
        <Route path="staff-management" element={<RoleRoute section="staff-management"><AdminStaffManagement /></RoleRoute>} />
        <Route path="security-center" element={<RoleRoute section="security-center"><AdminSecurityCenter /></RoleRoute>} />
        <Route path="backup-maintenance" element={<RoleRoute section="backup-maintenance"><AdminBackupMaintenance /></RoleRoute>} />
        <Route path="analytics-hub" element={<RoleRoute section="analytics-hub"><AdminAnalyticsHub /></RoleRoute>} />
        <Route path="settings-hub" element={<RoleRoute section="settings-hub"><AdminSettingsHub /></RoleRoute>} />
        <Route path="advanced-tools" element={<RoleRoute section="advanced-tools"><AdminAdvancedTools /></RoleRoute>} />
        <Route path="offers" element={<RoleRoute section="offers"><AdminOffers /></RoleRoute>} />
        <Route path="copy-protection" element={<RoleRoute section="copy-protection"><AdminCopyProtection /></RoleRoute>} />

      </Routes>
      </Suspense>
    </AdminLayout>
  </ProtectedRoute>
  );
};


// Root component that injects analytics on every page load
const AppWithAnalytics = () => {
  useAnalyticsInjection();
  useApplyCopyProtection();
  return (
    <Suspense fallback={<PageFallback />}>
      <SEO />
      <AutoStructuredData />
      <SiteBackground />
      <div className="relative z-10">
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
        <Route path="/services/:slug" element={<ServiceCategoryPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/team" element={<TeamPage />}/>
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
        <Route path="/payment/bkash/callback" element={<BkashCallbackPage />} />
        <Route path="/refund-request" element={<RefundRequestPage />} />
        <Route path="/my-refunds" element={<MyRefundsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/ai-search" element={<AiSearchPage />} />
        <Route path="/tech/:slug" element={<TechDetailPage />} />
        <Route path="/unsubscribe" element={<UnsubscribePage />} />
        <Route path="/offer/:slug" element={<OfferPage />} />

        {/* Admin Routes (mounted at /ceo) */}
        <Route path="/ceo/login" element={<AdminLogin />} />
        <Route path="/ceo/*" element={<AdminRoutes />} />
        {/* /admin paths intentionally NOT mapped — show 404 to keep real admin path private */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
      <ThemeAppearanceProvider />
      <GlobalSupport />
      <WelcomePopup />
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

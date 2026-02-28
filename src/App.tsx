import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import {
  AdminPortfolio, AdminBlog, AdminTestimonials, AdminTeam,
  AdminClients, AdminPricing, AdminFAQ, AdminCareers
} from "./pages/admin/AdminCrud";

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
        <Route path="services" element={<AdminServices />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="pricing" element={<AdminPricing />} />
        <Route path="faq" element={<AdminFAQ />} />
        <Route path="careers" element={<AdminCareers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
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
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

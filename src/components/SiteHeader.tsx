import { useState } from "react";
import { Search, Phone, Mail, Menu, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services", hasDropdown: false },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50"
    >
      {/* Top utility bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6"
          >
            <a href="tel:+8801820060046" className="flex items-center gap-1.5 hover:text-accent transition-colors duration-300">
              <Phone size={12} />
              <span>01820-060046</span>
            </a>
            <a href="mailto:info@shahedit.com" className="hidden sm:flex items-center gap-1.5 hover:text-accent transition-colors duration-300">
              <Mail size={12} />
              <span>info@shahedit.com</span>
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <span className="text-background/60">24/7 Support</span>
            <span className="text-accent font-medium shimmer px-2 py-0.5 rounded">Free Shipping Worldwide</span>
          </motion.div>
        </div>
      </div>

      {/* Main header - glossy */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)" }}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <motion.a
            href="#"
            className="shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Shahed</span>
              <span className="text-foreground"> IT</span>
            </span>
          </motion.a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-lg relative group">
            <Input
              placeholder="Search for services..."
              className="pr-12 bg-secondary/80 border-0 rounded-full pl-5 h-11 focus-visible:ring-primary/30 transition-shadow duration-300 group-hover:shadow-md"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary text-primary-foreground glossy-btn hover:scale-105 transition-transform duration-200"
            >
              <Search size={16} />
            </Button>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/get-quote">
              <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold glossy-btn cursor-pointer"
              >
                Get a Quote
              </motion.span>
            </Link>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block border-t border-border/30">
          <div className="container mx-auto px-4 flex items-center gap-0.5">
            {navLinks.map((link, i) => (
              <Link key={link.label} to={link.href}>
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="px-5 py-3 text-sm font-medium transition-all duration-300 relative group flex items-center text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300" />
                </motion.span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block py-2.5 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              ))}
              <Link to="/get-quote" className="block mt-3" onClick={() => setMobileOpen(false)}>
                <span className="block text-center py-2.5 px-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl">Get a Quote</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SiteHeader;

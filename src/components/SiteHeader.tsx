import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home",      href: "/" },
  { label: "Services",  href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog",      href: "/blog" },
  { label: "Pricing",   href: "/pricing" },
  { label: "About",     href: "/about" },
  { label: "Contact",   href: "/contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <header role="banner" className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="hidden md:block bg-foreground text-background">
        <div className="container mx-auto flex items-center justify-between py-1.5 text-xs">
          <div className="flex items-center gap-5">
            <a
              href="tel:+8801840099853"
              className="flex items-center gap-1.5 text-background/70 hover:text-background transition-colors"
              aria-label="Call us at 01840-099853"
            >
              <Phone size={11} aria-hidden="true" />
              <span>01840-099853</span>
            </a>
            <a
              href="mailto:info@shahedit.com"
              className="flex items-center gap-1.5 text-background/70 hover:text-background transition-colors"
              aria-label="Email us at info@shahedit.com"
            >
              <Mail size={11} aria-hidden="true" />
              <span>info@shahedit.com</span>
            </a>
          </div>
          <span className="text-background/50">Mon–Sat: 9:00 AM – 6:00 PM</span>
        </div>
      </div>

      {/* Main nav */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "bg-background border-b transition-all duration-300",
          scrolled ? "border-border shadow-soft" : "border-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between h-16 gap-8">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Shahed IT — Home"
            className="flex-shrink-0 flex items-center gap-2 group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
              aria-hidden="true"
            >
              S
            </div>
            <span className="font-heading font-bold text-lg text-foreground tracking-tight">
              Shahed <span className="gradient-text">IT</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring",
                    isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link
              to="/get-quote"
              className="btn-primary text-sm"
            >
              Get Free Quote
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border bg-background"
            >
              <ul className="container mx-auto py-4 space-y-1" role="list">
                {navLinks.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={link.href}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                <li className="pt-2">
                  <Link to="/get-quote" className="btn-primary w-full justify-center text-sm">
                    Get Free Quote
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default SiteHeader;

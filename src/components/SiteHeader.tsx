import { useState } from "react";
import { Search, Phone, Mail, User, Heart, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#services", hasDropdown: true },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About Us", href: "#about" },
  { label: "Contacts", href: "#contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <a href="tel:+8801840099853" className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone size={12} />
              <span>01840-099853</span>
            </a>
            <a href="mailto:info@shahedit.com" className="hidden sm:flex items-center gap-1.5 hover:text-accent transition-colors">
              <Mail size={12} />
              <span>info@shahedit.com</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-background/60">24/7 Support</span>
            <span className="text-accent font-medium">Free Shipping Worldwide</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <a href="#" className="shrink-0">
            <span className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Shahed</span>
              <span className="text-foreground"> IT</span>
            </span>
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <Input
              placeholder="Search for services..."
              className="pr-12 bg-secondary border-0 rounded-full pl-5 h-11 focus-visible:ring-primary/30"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary text-primary-foreground"
            >
              <Search size={16} />
            </Button>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
              <User size={20} />
            </button>
            <button className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all relative">
              <Heart size={20} />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">0</span>
            </button>
            <button className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-all relative">
              <ShoppingCart size={20} />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">0</span>
            </button>
            <span className="text-sm font-semibold text-foreground ml-1">৳ 0.00</span>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block border-t border-border/50">
          <div className="container mx-auto px-4 flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-5 py-3 text-sm font-medium transition-all relative group ${
                  link.label === "Home"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={13} className="inline ml-1 opacity-50" />}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                  link.label === "Home" ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </a>
            ))}
            <div className="ml-auto flex items-center gap-3 py-2">
              <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-secondary rounded-full">BDT</span>
              <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-secondary rounded-full">USDT</span>
            </div>
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
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="relative mb-4">
                <Input placeholder="Search for services..." className="pr-12 rounded-full bg-secondary border-0 pl-5" />
                <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground">
                  <Search size={14} />
                </Button>
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2.5 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SiteHeader;

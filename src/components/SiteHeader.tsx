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
            <a href="tel:+8801840099853" className="flex items-center gap-1.5 hover:text-accent transition-colors duration-300">
              <Phone size={12} />
              <span>01840-099853</span>
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

          {/* Actions */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { icon: User, badge: null },
              { icon: Heart, badge: "0" },
              { icon: ShoppingCart, badge: "0" },
            ].map(({ icon: Icon, badge }, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 relative"
              >
                <Icon size={20} />
                {badge !== null && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">{badge}</span>
                )}
              </motion.button>
            ))}
            <span className="text-sm font-semibold text-foreground ml-2">৳ 0.00</span>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:block border-t border-border/30">
          <div className="container mx-auto px-4 flex items-center gap-0.5">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`px-5 py-3 text-sm font-medium transition-all duration-300 relative group ${
                  link.label === "Home" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={13} className="inline ml-1 opacity-50" />}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-400 ${
                  link.label === "Home" ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </motion.a>
            ))}
            <div className="ml-auto flex items-center gap-3 py-2">
              {["BDT", "USDT"].map((c) => (
                <motion.span
                  key={c}
                  whileHover={{ scale: 1.05 }}
                  className="text-xs font-medium text-muted-foreground px-3 py-1 bg-secondary/80 rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  {c}
                </motion.span>
              ))}
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
            transition={{ duration: 0.3 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="relative mb-4">
                <Input placeholder="Search for services..." className="pr-12 rounded-full bg-secondary border-0 pl-5" />
                <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground">
                  <Search size={14} />
                </Button>
              </div>
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="block py-2.5 px-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SiteHeader;

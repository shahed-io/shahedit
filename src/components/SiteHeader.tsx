import { useState } from "react";
import { Search, Phone, Globe, User, Heart, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Shahed IT", href: "#" },
  { label: "Services", href: "#services", hasDropdown: true },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About Us", href: "#about" },
  { label: "Contacts", href: "#contact" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="text-xl font-bold text-primary shrink-0">
            Shahed IT
          </a>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <Input
              placeholder="Search for products"
              className="pr-12 bg-background"
            />
            <Button
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none bg-primary text-primary-foreground"
            >
              <Search size={18} />
            </Button>
          </div>

          {/* Info */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="text-sm">
              <span className="text-muted-foreground">24 Support</span>
              <br />
              <a href="tel:+8801820060046" className="text-primary font-medium">
                +880 1820060046
              </a>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Worldwide</span>
              <br />
              <span className="text-primary font-medium">Free Shipping</span>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="bg-card">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-3 text-sm font-medium transition-colors hover:text-primary ${
                  link.label === "Shahed IT"
                    ? "text-primary border-b-2 border-primary"
                    : "text-foreground"
                }`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown size={14} className="inline ml-1" />}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground px-2">BDT</span>
            <span className="text-sm text-muted-foreground px-2">USDT</span>
            <button className="p-2 text-foreground hover:text-primary transition-colors">
              <User size={20} />
            </button>
            <button className="p-2 text-foreground hover:text-primary transition-colors relative">
              <Heart size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">0</span>
            </button>
            <button className="p-2 text-foreground hover:text-primary transition-colors relative flex items-center gap-1">
              <ShoppingCart size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">0</span>
              <span className="text-sm ml-3">৳ 0.00</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-2">
          <div className="relative mb-3">
            <Input placeholder="Search for products" className="pr-12" />
            <Button size="icon" className="absolute right-0 top-0 h-full rounded-l-none bg-primary text-primary-foreground">
              <Search size={18} />
            </Button>
          </div>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-sm font-medium text-foreground hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">24 Support: <a href="tel:+8801820060046" className="text-primary">+880 1820060046</a></span>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;

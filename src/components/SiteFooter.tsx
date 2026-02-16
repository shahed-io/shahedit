import { Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SiteFooter = () => {
  return (
    <footer className="bg-card border-t border-border pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold text-primary mb-3">Shahed IT</h3>
            <p className="text-sm text-muted-foreground mb-4">Contact Us</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} />
                <span>Hotline: 01840-099853</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} />
                <span>info@shahedit.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Web Development", "Graphics Design", "UI/UX Design", "Digital Marketing", "IT Support", "Facebook"].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-primary transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase">Information</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["About Us", "Our Services", "Portfolio", "Blog", "FAQs", "Contact Us"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase">Policies</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Support Center", "Delivery Policy", "Order & Cancellation"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-sm uppercase">
              Subscribe for Update News
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Will be used in accordance with our{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Your email"
                type="email"
                className="text-sm"
              />
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Shahed IT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

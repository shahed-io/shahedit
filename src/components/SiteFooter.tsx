import { Phone, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-accent">Shahed</span> IT
            </h3>
            <p className="text-background/50 text-sm mb-5">
              Professional digital service agency for web development and graphic design.
            </p>
            <div className="space-y-3 text-sm">
              <a href="tel:01840099853" className="flex items-center gap-2.5 text-background/60 hover:text-accent transition-colors">
                <Phone size={14} />
                <span>Hotline: 01840-099853</span>
              </a>
              <a href="mailto:info@shahedit.com" className="flex items-center gap-2.5 text-background/60 hover:text-accent transition-colors">
                <Mail size={14} />
                <span>info@shahedit.com</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {["Web Development", "Graphics Design", "UI/UX Design", "Digital Marketing", "IT Support", "Facebook"].map((s) => (
                <li key={s}>
                  <a href="#" className="text-background/50 hover:text-accent transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">Information</h4>
            <ul className="space-y-2.5 text-sm">
              {["About Us", "Our Services", "Portfolio", "Blog", "FAQs", "Contact Us"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/50 hover:text-accent transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2.5 text-sm">
              {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Support Center", "Delivery Policy", "Order & Cancellation"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-background/50 hover:text-accent transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wider">
              Subscribe for Updates
            </h4>
            <p className="text-xs text-background/40 mb-4">
              Will be used in accordance with our{" "}
              <a href="#" className="text-accent hover:underline">Privacy Policy</a>
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Your email"
                type="email"
                className="text-sm bg-background/10 border-background/20 text-background placeholder:text-background/30 rounded-full h-10"
              />
              <Button size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-10 w-10 shrink-0">
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © 2026 Shahed IT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

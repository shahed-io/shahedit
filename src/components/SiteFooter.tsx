import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUp } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Web Development",    href: "/services" },
    { label: "Mobile App",         href: "/services" },
    { label: "E-Commerce",         href: "/services" },
    { label: "Digital Marketing",  href: "/services" },
    { label: "UI/UX Design",       href: "/services" },
  ],
  Company: [
    { label: "About Us",   href: "/about" },
    { label: "Portfolio",  href: "/portfolio" },
    { label: "Blog",       href: "/blog" },
    { label: "Careers",    href: "/careers" },
    { label: "Contact",    href: "/contact" },
  ],
  Support: [
    { label: "FAQ",         href: "/faq" },
    { label: "Pricing",     href: "/pricing" },
    { label: "Get a Quote", href: "/get-quote" },
  ],
};

const socials = [
  { label: "Facebook", href: "#", glyph: "f" },
  { label: "LinkedIn", href: "#", glyph: "in" },
  { label: "Twitter",  href: "#", glyph: "𝕏" },
  { label: "YouTube",  href: "#", glyph: "▶" },
];

const SiteFooter = () => {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer role="contentinfo" className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" aria-label="Shahed IT — Go to home page" className="inline-flex items-center gap-2.5 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
                aria-hidden="true"
              >S</div>
              <span className="font-heading font-bold text-xl text-white tracking-tight">
                Shahed <span className="gradient-text">IT</span>
              </span>
            </Link>
            <p className="text-background/55 text-sm leading-relaxed mb-6 max-w-xs">
              Professional IT solutions for businesses of all sizes. Web, mobile, and digital marketing expertise since 2014.
            </p>
            <address className="not-italic space-y-2.5">
              {[
                { Icon: Phone, value: "+880 1840-099853", href: "tel:+8801840099853", label: "Phone" },
                { Icon: Mail,  value: "info@shahedit.com", href: "mailto:info@shahedit.com", label: "Email" },
                { Icon: MapPin, value: "Dhaka, Bangladesh", href: "#", label: "Address" },
              ].map(({ Icon, value, href, label }) => (
                <a key={label} href={href} aria-label={`${label}: ${value}`}
                  className="flex items-center gap-2.5 text-sm text-background/55 hover:text-background transition-colors group"
                >
                  <Icon size={14} className="text-primary flex-shrink-0" aria-hidden="true" />
                  {value}
                </a>
              ))}
            </address>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <nav key={group} aria-label={`${group} links`}>
              <h3 className="text-white font-semibold text-sm mb-4">{group}</h3>
              <ul className="space-y-2.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href}
                      className="text-sm text-background/55 hover:text-background transition-colors focus-visible:underline"
                    >{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-xs">
            © {new Date().getFullYear()} Shahed IT. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a key={s.label} href={s.href} aria-label={`Follow Shahed IT on ${s.label}`}
                className="w-8 h-8 rounded-lg bg-background/10 hover:bg-primary flex items-center justify-center text-xs text-background/55 hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span aria-hidden="true">{s.glyph}</span>
              </a>
            ))}
            <button onClick={scrollTop} aria-label="Scroll back to top"
              className="w-8 h-8 rounded-lg bg-primary hover:bg-primary/80 flex items-center justify-center ml-2 transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            >
              <ArrowUp size={14} className="text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

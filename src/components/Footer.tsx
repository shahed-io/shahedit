const Footer = () => {
  return (
    <footer className="hero-bg py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 text-primary-foreground/80">
          <div>
            <h3 className="text-xl font-bold text-primary-foreground font-['Space_Grotesk'] mb-3">
              <span className="text-gradient">TechNova</span>
            </h3>
            <p className="text-sm leading-relaxed">
              আপনার বিশ্বস্ত আইটি পার্টনার। আমরা আধুনিক প্রযুক্তি দিয়ে আপনার বিজনেসকে এগিয়ে নিয়ে যাই।
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-3">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              {["হোম", "সার্ভিস", "আমাদের সম্পর্কে", "যোগাযোগ"].map((link) => (
                <li key={link}>
                  <a href={`#${link}`} className="hover:text-primary-foreground transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-3">সার্ভিস</h4>
            <ul className="space-y-2 text-sm">
              {["ওয়েব ডেভেলপমেন্ট", "অ্যাপ ডেভেলপমেন্ট", "ক্লাউড সার্ভিস", "সাইবার সিকিউরিটি"].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-sm text-primary-foreground/50">
          © ২০২৬ TechNova. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;

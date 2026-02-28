import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Star, Users, FolderOpen } from "lucide-react";

const stats = [
  { icon: Users,      value: "500+", label: "Happy Clients" },
  { icon: FolderOpen, value: "1000+", label: "Projects Done" },
  { icon: Star,       value: "4.9",  label: "Average Rating" },
];

const HeroBanner = () => (
  <section
    className="relative overflow-hidden hero-gradient"
    aria-labelledby="hero-heading"
  >
    {/* Subtle grid overlay */}
    <div className="absolute inset-0 subtle-grid opacity-60" aria-hidden="true" />

    {/* Gradient blobs */}
    <div
      className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 float-anim"
      style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)" }}
      aria-hidden="true"
    />
    <div
      className="absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full opacity-20 float-anim"
      style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.4), transparent 70%)", animationDelay: "2.5s" }}
      aria-hidden="true"
    />

    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px] py-20 md:py-28">

        {/* Left: Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label mb-4 block">🇧🇩 Bangladesh's Leading IT Agency</span>
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-heading font-bold leading-tight mb-5"
          >
            We Build
            <br />
            <span className="gradient-text">Digital Solutions</span>
            <br />
            That Scale
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg"
          >
            From web apps to mobile platforms — we craft high-performance digital products that help businesses grow faster and smarter.
          </motion.p>

          {/* Key points */}
          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 mb-8"
            role="list"
          >
            {["On-time delivery, always", "Transparent pricing, no surprises", "Dedicated support team"].map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle size={16} className="text-accent flex-shrink-0" aria-hidden="true" />
                {point}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link to="/get-quote" className="btn-primary text-base px-6 py-3">
              Get Free Quote
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/portfolio" className="btn-secondary text-base px-6 py-3">
              View Our Work
            </Link>
          </motion.div>
        </div>

        {/* Right: Stats + Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          {/* Main visual card */}
          <div className="tech-card rounded-2xl p-8 mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
                aria-hidden="true"
              >
                <span className="text-white text-xl">💻</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Full Stack Development</p>
                <p className="text-xs text-muted-foreground">React, Node.js, Laravel & More</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["React", "Node.js", "Laravel", "Flutter", "Next.js", "MySQL"].map((tech) => (
                <div key={tech} className="bg-secondary rounded-lg px-2.5 py-2 text-xs font-medium text-center text-foreground">{tech}</div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="tech-card rounded-xl p-4 text-center">
                <Icon size={18} className="text-primary mx-auto mb-2" aria-hidden="true" />
                <p className="text-xl font-bold font-heading text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroBanner;

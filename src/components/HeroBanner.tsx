import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 7);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="bg-muted">
      <div className="container mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          {/* Main banner */}
          <div className="relative rounded-lg overflow-hidden min-h-[300px] md:min-h-[400px]">
            <img
              src={heroBanner}
              alt="Web Development Services"
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center h-full">
              <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
                Web Development
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Professional web development services for your business
              </p>

              {/* Countdown */}
              <div className="flex gap-2 mb-6">
                {[
                  { val: countdown.days, label: "Days" },
                  { val: countdown.hours, label: "Hr" },
                  { val: countdown.mins, label: "Min" },
                  { val: countdown.secs, label: "Sc" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-card text-foreground rounded-md px-3 py-2 text-center min-w-[50px]"
                  >
                    <div className="text-lg font-bold">{pad(item.val)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{item.label}</div>
                  </div>
                ))}
              </div>

              <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                Buy Now
              </Button>
            </div>
          </div>

          {/* Side banners */}
          <div className="grid grid-rows-2 gap-4">
            <div className="bg-card rounded-lg p-6 flex items-center justify-between border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Shop Now</p>
                <p className="font-semibold text-foreground">Latest Services</p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
            <div className="bg-card rounded-lg p-6 flex items-center justify-between border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Pre-Order</p>
                <p className="font-semibold text-foreground">Upcoming Projects</p>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

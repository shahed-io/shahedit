import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Shahed IT
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            <strong className="text-foreground">Shahed IT</strong> is a professional digital service agency focused on{" "}
            <strong className="text-foreground">web development and graphic design</strong> for modern businesses and growing brands.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We specialize in building responsive, user-friendly websites and creating clean, visually consistent design solutions that help businesses establish a strong and credible online presence. Every project we take on is approached with attention to detail, clarity, and long-term value.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our strength lies in understanding client goals and translating them into practical digital solutions. From business websites to brand visuals, we combine thoughtful design with reliable development to deliver results that work across devices and platforms.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            If you are looking for a trusted partner for professional{" "}
            <strong className="text-foreground">web development and graphic design services</strong>, Shahed IT is here to support your business with quality-driven solutions.
          </p>
          <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
            Read More <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

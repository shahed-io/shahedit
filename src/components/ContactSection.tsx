import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">যোগাযোগ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-['Space_Grotesk']">
            আমাদের সাথে যোগাযোগ করুন
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            আপনার প্রজেক্ট নিয়ে আলোচনা করতে চান? আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-['Space_Grotesk']">
                আমাদের অফিস
              </h3>
              <p className="text-muted-foreground mb-8">
                যেকোনো প্রশ্ন বা প্রজেক্ট সম্পর্কে জানতে নিচের মাধ্যমে যোগাযোগ করুন।
              </p>
            </div>

            {[
              { icon: MapPin, label: "ঠিকানা", value: "ঢাকা, বাংলাদেশ" },
              { icon: Phone, label: "ফোন", value: "+৮৮০ ১৭XX-XXXXXX" },
              { icon: Mail, label: "ইমেইল", value: "info@technova.com.bd" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <item.icon className="text-secondary" size={20} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="text-foreground font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5 bg-card border border-border rounded-xl p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="আপনার নাম" className="bg-muted/50" />
              <Input placeholder="ইমেইল" type="email" className="bg-muted/50" />
            </div>
            <Input placeholder="বিষয়" className="bg-muted/50" />
            <Textarea placeholder="আপনার মেসেজ লিখুন..." rows={5} className="bg-muted/50 resize-none" />
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              মেসেজ পাঠান <Send className="ml-2" size={16} />
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

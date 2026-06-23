import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Mail, Phone, Linkedin, Twitter, Crown, Calendar, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";


interface TeamMember {
  id: string;
  name: string;
  role: string;
  designation?: string | null;
  department?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  joining_date?: string | null;
  is_owner?: boolean | null;
  sort_order?: number | null;
}

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0]).join("").toUpperCase();

const MemberCard = ({ m, featured = false }: { m: TeamMember; featured?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className={`group relative rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col ${
      featured ? "border-amber-400/60 ring-2 ring-amber-400/30" : "border-border hover:border-primary/40"
    } transition-all hover:shadow-lg`}
  >
    {featured && (
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow">
        <Crown className="w-3.5 h-3.5" /> Owner
      </div>
    )}
    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/40 overflow-hidden flex items-center justify-center">
      {m.avatar_url ? (
        <img
          src={m.avatar_url}
          alt={m.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-primary/10 text-primary text-4xl font-bold flex items-center justify-center">
          {initials(m.name)}
        </div>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-bold text-lg leading-tight">{m.name}</h3>
      <p className="text-sm text-primary font-medium mt-0.5">{m.designation || m.role}</p>
      {m.department && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="w-3 h-3" /> {m.department}
        </p>
      )}
      {m.bio && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{m.bio}</p>
      )}

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        {m.email && (
          <a href={`mailto:${m.email}`} className="flex items-center gap-2 hover:text-primary truncate">
            <Mail className="w-3.5 h-3.5 shrink-0" /> {m.email}
          </a>
        )}
        {m.phone && (
          <a href={`tel:${m.phone}`} className="flex items-center gap-2 hover:text-primary">
            <Phone className="w-3.5 h-3.5 shrink-0" /> {m.phone}
          </a>
        )}
        {m.joining_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            যোগদান: {new Date(m.joining_date).toLocaleDateString("bn-BD")}
          </div>
        )}
      </div>

      {(m.linkedin_url || m.twitter_url) && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
          {m.linkedin_url && (
            <a
              href={m.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {m.twitter_url && (
            <a
              href={m.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await (supabase as any)
      .from("team_members_public")
      .select("*")
      .order("is_owner", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setMembers((data ?? []) as TeamMember[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useRealtimeSync("team_members", load);


  const owner = members.find(m => m.is_owner);
  const staff = members.filter(m => !m.is_owner);

  // Group staff by department
  const departments = Array.from(
    new Set(staff.map(s => s.department || "Team").filter(Boolean))
  ) as string[];

  return (
    <>
      <Helmet>
        <title>আমাদের টিম — Shahed IT</title>
        <meta
          name="description"
          content="Shahed IT-এর মালিক এবং দক্ষ কর্মীদের সাথে পরিচিত হন। তাদের পরিচয়, দায়িত্ব এবং যোগাযোগের তথ্য।"
        />
      </Helmet>

      <main className="min-h-screen pb-20">
        <section className="relative pt-16 pb-12 px-4 text-center bg-gradient-to-b from-primary/5 to-transparent">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              আমাদের <span className="text-primary">টিম</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              আমাদের কোম্পানির মালিক ও কর্মীদের সাথে পরিচিত হোন — তাদের পরিচয়, দায়িত্ব এবং কাজের ক্ষেত্র।
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-muted" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              এখনো কোনো টিম মেম্বার যোগ করা হয়নি।
            </div>
          ) : (
            <>
              {owner && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-500" />
                    কোম্পানির মালিক
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <MemberCard m={owner} featured />
                    </div>
                    <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-8">
                      <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                        {owner.designation || owner.role}
                      </p>
                      <h3 className="text-3xl font-bold mt-2">{owner.name}</h3>
                      {owner.bio && (
                        <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                          {owner.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {staff.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6">আমাদের কর্মীগণ</h2>
                  {departments.length > 1 ? (
                    departments.map(dept => {
                      const list = staff.filter(s => (s.department || "Team") === dept);
                      if (list.length === 0) return null;
                      return (
                        <div key={dept} className="mb-12">
                          <h3 className="text-lg font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> {dept}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {list.map(m => <MemberCard key={m.id} m={m} />)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {staff.map(m => <MemberCard key={m.id} m={m} />)}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

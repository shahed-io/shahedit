import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { StarRating } from "./StarRating";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

const reviewSchema = z.object({
  rating: z.number().int().min(1, "রেটিং দিন").max(5),
  comment: z
    .string()
    .trim()
    .max(1000, "মন্তব্য ১০০০ অক্ষরের কম হতে হবে")
    .optional(),
});

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

// Random Bangladeshi names pool — deterministic pick by review id keeps name stable per review
const RANDOM_NAMES = [
  "Rahim Uddin", "Karim Hossain", "Sadia Akter", "Tanvir Ahmed", "Mehedi Hasan",
  "Nusrat Jahan", "Arif Khan", "Sumaiya Islam", "Farhan Rahman", "Jannatul Ferdous",
  "Shakib Mahmud", "Tasnim Sultana", "Imran Hossain", "Maria Akter", "Rakib Hasan",
  "Fahim Reza", "Sabbir Ahmed", "Mahmuda Khatun", "Tanjila Akter", "Hasibul Islam",
  "Naimur Rahman", "Mahfuzur Rahman", "Sumon Mia", "Rabeya Sultana", "Kamrul Hasan",
  "Mizanur Rahman", "Asif Iqbal", "Tasnova Tabassum", "Rifat Chowdhury", "Sharmin Akter",
  "Shahriar Kabir", "Nadia Islam", "Mahin Sarkar", "Tania Rahman", "Junaid Ahmed",
  "Rezaul Karim", "Suborna Akter", "Nayeem Hossain", "Ishrat Jahan", "Tahmid Hasan",
  "Foysal Ahmed", "Lamia Akter", "Rifa Tasnim", "Saiful Islam", "Mehnaz Hossain",
  "Anisur Rahman", "Sharmili Sultana", "Tousif Mahmud", "Adiba Khan", "Rumana Akter",
];

const pickName = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return RANDOM_NAMES[h % RANDOM_NAMES.length];
};

export function ProductReviews({
  packageId,
  accentColor = "hsl(270,92%,65%)",
  onChange,
}: {
  packageId: string;
  accentColor?: string;
  onChange?: () => void;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews" as any)
      .select("id, user_id, rating, comment, created_at")
      .eq("package_id", packageId)
      .order("created_at", { ascending: false });
    const rows = (data as unknown as Review[] | null) ?? [];
    setReviews(rows);

    // Try fetch profile names (RLS only allows own profile, others may be null)
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", ids);
      if (profs) {
        const m = new Map(profs.map((p: any) => [p.user_id, p]));
        setReviews(
          rows.map((r) => ({
            ...r,
            profiles: m.get(r.user_id) ?? null,
          }))
        );
      }
    }

    const mine = user ? rows.find((r) => r.user_id === user.id) ?? null : null;
    setMyReview(mine);
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment ?? "");
    } else {
      setRating(0);
      setComment("");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = reviewSchema.safeParse({ rating, comment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const payload = {
      package_id: packageId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
    };
    const { error } = await supabase
      .from("product_reviews" as any)
      .upsert(payload, { onConflict: "package_id,user_id" });
    setSubmitting(false);
    if (error) {
      toast.error("রিভিউ সংরক্ষণ ব্যর্থ");
      return;
    }
    toast.success(myReview ? "রিভিউ আপডেট হয়েছে" : "ধন্যবাদ! রিভিউ সংরক্ষিত");
    setEditing(false);
    await load();
    onChange?.();
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!confirm("আপনার রিভিউ মুছে ফেলতে চান?")) return;
    const { error } = await supabase
      .from("product_reviews" as any)
      .delete()
      .eq("id", myReview.id);
    if (error) {
      toast.error("মুছে ফেলা যায়নি");
      return;
    }
    toast.success("রিভিউ মুছে ফেলা হয়েছে");
    await load();
    onChange?.();
  };

  const showForm = user && (!myReview || editing);

  return (
    <section
      className="mt-12 rounded-3xl p-6 md:p-8"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl md:text-2xl font-black text-foreground">
          রিভিউ ও রেটিং
        </h2>
        <span className="text-xs text-foreground/50">
          মোট {toBn(reviews.length)} জন রিভিউ দিয়েছেন
        </span>
      </div>

      {/* Submit / edit form */}
      {!user ? (
        <div
          className="p-4 rounded-2xl text-sm text-foreground/70 mb-6"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          রিভিউ দিতে{" "}
          <Link to="/login" className="font-bold underline" style={{ color: accentColor }}>
            লগইন করুন
          </Link>
          ।
        </div>
      ) : showForm ? (
        <form
          onSubmit={handleSubmit}
          className="p-4 md:p-5 rounded-2xl mb-6"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
        >
          <p className="text-sm font-bold text-foreground mb-3">
            {myReview ? "আপনার রিভিউ এডিট করুন" : "একটি রিভিউ লিখুন"}
          </p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hoverRating || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(n)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${n} star`}
                >
                  <Star
                    size={26}
                    style={{
                      color: active ? "hsl(45,93%,58%)" : "hsl(0,0%,40%)",
                      fill: active ? "hsl(45,93%,58%)" : "transparent",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="আপনার অভিজ্ঞতা শেয়ার করুন (ঐচ্ছিক)..."
            className="w-full px-3 py-2 rounded-xl bg-background/50 border border-white/10 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-white/25 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)` }}
            >
              <Send size={14} />
              {submitting ? "সংরক্ষণ হচ্ছে..." : myReview ? "আপডেট করুন" : "জমা দিন"}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setRating(myReview.rating);
                  setComment(myReview.comment ?? "");
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/60 hover:text-foreground"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>
      ) : (
        myReview && (
          <div
            className="p-4 rounded-2xl mb-6 flex items-start justify-between gap-3"
            style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}25` }}
          >
            <div>
              <p className="text-xs text-foreground/50 mb-1">আপনার রিভিউ</p>
              <StarRating average={myReview.rating} showText={false} size={14} />
              {myReview.comment && (
                <p className="text-sm text-foreground/80 mt-2">{myReview.comment}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-white/10"
                title="এডিট"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                title="মুছুন"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-foreground/40 text-center py-6">লোড হচ্ছে...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-foreground/40 text-center py-6">
          এই প্যাকেজে এখনো কোনো রিভিউ নেই — প্রথম রিভিউটি আপনিই দিন!
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {reviews.map((r) => {
              const name = pickName(r.id);
              const initial = name.charAt(0).toUpperCase();
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {r.profiles?.avatar_url ? (
                      <img
                        src={r.profiles.avatar_url}
                        alt={name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                        }}
                      >
                        {initial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {name}
                      </p>
                      <p className="text-xs text-foreground/40">
                        {new Date(r.created_at).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <StarRating average={r.rating} showText={false} size={14} />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground/75 leading-relaxed pl-12">
                      {r.comment}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

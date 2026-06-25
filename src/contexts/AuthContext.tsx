import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/supabase-types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roleLoading: true,
  role: null,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);

  const fetchRole = async (userId: string) => {
    setRoleLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setRole((data?.role as AppRole) ?? null);
    setRoleLoading(false);
    return (data?.role as AppRole) ?? null;
  };

  const syncProfileFromOAuth = async (u: User) => {
    const meta = u.user_metadata ?? {};
    const oauthName = meta.full_name ?? meta.name ?? null;
    const oauthAvatar = meta.avatar_url ?? meta.picture ?? null;
    if (!oauthName && !oauthAvatar) return;
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .eq("user_id", u.id)
      .maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({
        user_id: u.id,
        full_name: oauthName,
        avatar_url: oauthAvatar,
      });
      return;
    }
    const patch: Record<string, string> = {};
    if (oauthName && !existing.full_name) patch.full_name = oauthName;
    if (oauthAvatar && !existing.avatar_url) patch.avatar_url = oauthAvatar;
    if (Object.keys(patch).length) {
      await supabase.from("profiles").update(patch as never).eq("user_id", u.id);
    }
  };

  useEffect(() => {
    let initialized = false;

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Refresh role in background — do NOT toggle global loading after first mount,
        // otherwise ProtectedRoute will unmount the AdminLayout on every token refresh
        // and the user will see a flash back to the dashboard/loading state.
        setTimeout(() => {
          fetchRole(session.user.id);
        }, 0);
        if (event === "SIGNED_IN") {
          setTimeout(() => syncProfileFromOAuth(session.user), 0);
        }
      } else {
        setRole(null);
        setRoleLoading(false);
      }
      if (!initialized) {
        initialized = true;
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRoleLoading(false);
      }
      initialized = true;
      setLoading(false);
    });
  }, []);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = role !== null;

  return (
    <AuthContext.Provider value={{ user, session, loading, roleLoading, role, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

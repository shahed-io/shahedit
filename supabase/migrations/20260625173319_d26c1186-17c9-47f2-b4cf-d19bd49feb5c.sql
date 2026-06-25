
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_tags TO authenticated;
GRANT ALL ON public.blog_tags TO service_role;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags read all" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "tags admin write" ON public.blog_tags FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id uuid,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','spam','trash')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_comments_post_idx ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS blog_comments_status_idx ON public.blog_comments(status);
GRANT SELECT ON public.blog_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_comments TO authenticated;
GRANT ALL ON public.blog_comments TO service_role;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments approved public" ON public.blog_comments FOR SELECT USING (status = 'approved' OR public.is_admin(auth.uid()));
CREATE POLICY "comments insert authed" ON public.blog_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "comments admin all" ON public.blog_comments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_blog_comments_updated BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

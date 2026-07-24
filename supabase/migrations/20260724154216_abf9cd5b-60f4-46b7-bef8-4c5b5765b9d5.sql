DROP POLICY IF EXISTS "Authenticated users upload media" ON public.media_assets;
DROP POLICY IF EXISTS "Users delete own media" ON public.media_assets;

CREATE POLICY "Admins upload media"
ON public.media_assets
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) AND auth.uid() = uploaded_by);

CREATE POLICY "Admins delete media"
ON public.media_assets
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
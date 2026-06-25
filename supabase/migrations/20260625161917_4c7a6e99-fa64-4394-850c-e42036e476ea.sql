CREATE POLICY "Clients can view their own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Add verification mode to site_settings
INSERT INTO public.site_settings (key, value, label, group_name, type)
VALUES ('payment_verification_mode', 'manual', 'Payment Verification Mode', 'payment', 'text')
ON CONFLICT (key) DO NOTHING;

-- Add status index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_submissions_status ON public.payment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_payment_submissions_created_at ON public.payment_submissions(created_at DESC);

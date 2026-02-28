
ALTER TABLE public.service_packages 
  ADD COLUMN IF NOT EXISTS badge text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS original_price numeric DEFAULT NULL;

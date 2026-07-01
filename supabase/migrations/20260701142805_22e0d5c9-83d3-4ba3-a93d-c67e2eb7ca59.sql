
CREATE TABLE IF NOT EXISTS public.ai_provider_settings (
  provider text PRIMARY KEY CHECK (provider IN ('lovable','gemini','openai','anthropic','xai')),
  api_key text,
  model text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT ALL ON public.ai_provider_settings TO service_role;
ALTER TABLE public.ai_provider_settings ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only service_role (edge functions) can read.

CREATE TABLE IF NOT EXISTS public.ai_active_provider (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  provider text NOT NULL DEFAULT 'lovable' CHECK (provider IN ('lovable','gemini','openai','anthropic','xai')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.ai_active_provider TO service_role;
ALTER TABLE public.ai_active_provider ENABLE ROW LEVEL SECURITY;

INSERT INTO public.ai_active_provider(id, provider) VALUES (1,'lovable') ON CONFLICT DO NOTHING;

-- Seed rows so admin UI can display all 5 providers
INSERT INTO public.ai_provider_settings(provider) VALUES ('lovable'),('gemini'),('openai'),('anthropic'),('xai')
ON CONFLICT DO NOTHING;

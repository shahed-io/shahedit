
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  badge_text text,
  headline text not null default '',
  highlight text,
  description text,
  primary_cta_label text,
  primary_cta_link text,
  secondary_cta_label text,
  secondary_cta_link text,
  show_countdown boolean not null default false,
  countdown_label text default 'Special Offer Ends In',
  countdown_end_at timestamptz,
  stats jsonb not null default '[]'::jsonb,
  cards jsonb not null default '[]'::jsonb,
  background_image_url text,
  autoplay_seconds integer not null default 7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

create policy "Public read active hero slides"
  on public.hero_slides for select
  using (is_active = true or public.is_admin(auth.uid()));

create policy "Admins manage hero slides"
  on public.hero_slides for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create trigger trg_hero_slides_updated_at
  before update on public.hero_slides
  for each row execute function public.update_updated_at_column();

insert into public.hero_slides (
  sort_order, is_active, badge_text, headline, highlight, description,
  primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link,
  show_countdown, countdown_label, countdown_end_at,
  stats, cards
) values (
  0, true,
  'Professional IT Agency — Bangladesh',
  'Build Your',
  'Digital Empire',
  'Premium web development, graphic design & digital marketing solutions for modern businesses — crafted to convert, impress & grow.',
  'Start Your Project', '/get-quote',
  'View Portfolio', '/portfolio',
  true, 'Special Offer Ends In', now() + interval '7 days',
  '[
    {"value":"150+","label":"Projects Completed"},
    {"value":"98%","label":"Client Satisfaction"},
    {"value":"5+","label":"Years Experience"},
    {"value":"24/7","label":"Support"}
  ]'::jsonb,
  '[
    {"title":"Web Development","subtitle":"92% Booked this month","badge_text":"#1 Best Seller","badge_color":"blue","price":"৳৫,০০০","original_price":"৳১০,০০০","link":"/services/web-development","accent":"hsl(270,92%,65%)","icon":"Code2"},
    {"title":"Graphics Design","subtitle":"87% Booked this month","badge_text":"Trending","badge_color":"amber","price":"৳১,৫০০","original_price":"৳৩,৫০০","link":"/services/graphics-design","accent":"hsl(320,90%,55%)","icon":"Sparkles"}
  ]'::jsonb
);

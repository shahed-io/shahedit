alter table public.service_packages
  add column if not exists gallery_urls text[] default '{}';

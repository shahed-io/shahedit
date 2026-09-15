-- Keep the admin product category list aligned with the storefront service categories.
insert into public.product_categories (name, slug, description, icon, sort_order, is_active)
values
  ('Web Development', 'web-development', 'Websites, e-commerce platforms, and custom web applications.', 'Globe', 1, true),
  ('Website Maintenance', 'website-maintenance', 'Updates, backups, security, and performance care.', 'Wrench', 2, true),
  ('Graphics Design', 'graphics-design', 'Brand identity, UI/UX, social creatives, and visual design.', 'Palette', 3, true),
  ('Facebook Services', 'facebook-services', 'Facebook setup, campaign management, and audience growth.', 'Facebook', 4, true),
  ('Digital Marketing', 'digital-marketing', 'SEO, content strategy, paid campaigns, and measurable growth.', 'TrendingUp', 5, true),
  ('Business Solutions', 'business-solutions', 'Domain, hosting, business email, and digital consultancy.', 'BriefcaseBusiness', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

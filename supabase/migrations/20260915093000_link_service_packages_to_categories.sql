-- Link existing service packages to the matching admin product category.
update public.service_packages p
set category_id = c.id
from public.services s
join public.product_categories c on c.slug = s.slug
where p.service_id = s.id
  and (p.category_id is null or p.category_id <> c.id);

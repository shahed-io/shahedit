
## লক্ষ্য

বর্তমান `service_packages` table-কে full Product Management system-এ পরিণত করা — নতুন আলাদা products module তৈরি না করে existing data ও pages অক্ষুণ্ণ রেখে।

## কী যোগ হবে

**1. Classification (Category / Sub-Category / Brand / Tags / SKU)**
- নতুন tables: `product_categories` (parent_id দিয়ে nested = category + sub-category), `product_brands`, `product_tags`, `product_tag_relations`
- `service_packages`-এ নতুন columns: `category_id`, `brand_id`, `sku` (unique), `barcode`
- Admin pages: `/admin/categories`, `/admin/brands`, `/admin/tags` — CRUD সহ
- Product edit form-এ dropdown/multi-select যোগ

**2. Image Gallery**
- নতুন table: `product_images` (package_id, url, sort_order, alt_text, is_primary)
- Admin product edit-এ multi-image upload + reorder + primary নির্বাচন
- Storage: existing `cms-media` bucket

**3. Product Variants**
- নতুন tables: `product_variants` (package_id, sku, price, sale_price, stock, image_url, is_active), `product_variant_options` (variant_id, option_name='Size'|'Color'|custom, option_value)
- Admin: variant builder UI — multiple option groups, auto-generated combinations, per-variant price/stock/SKU

**4. SEO Settings + Schedule Publish**
- `service_packages`-এ columns: `meta_title`, `meta_description`, `meta_keywords`, `og_image`, `canonical_url`, `scheduled_publish_at`, `publish_status` ('draft'|'scheduled'|'published')
- Cron job (pg_cron) প্রতি ৫ মিনিটে scheduled → published auto-switch করবে
- Product edit-এ SEO tab + Schedule tab

**5. Digital Delivery**
- নতুন tables:
  - `digital_files` (package_id, file_url, file_name, file_size, version, download_limit, expiry_days)
  - `license_keys` (package_id, key_value unique, status='available'|'assigned'|'revoked', assigned_to_user_id, assigned_at, order_id)
  - `digital_downloads` (user_id, package_id, file_id, download_count, last_downloaded_at, license_key_id)
- Storage: নতুন **private** bucket `digital-products` (signed URL access)
- Admin pages:
  - `/admin/digital-files` — package অনুযায়ী file upload + download limit + expiry
  - `/admin/license-keys` — bulk paste/CSV upload license key pool, status filter, manual revoke
- Order verify হলে: trigger automatically এক available license key assign করবে user-কে, digital_downloads row তৈরি করবে
- User Dashboard-এ নতুন "My Downloads" section — signed URL দিয়ে file download (limit reach হলে block)

**6. Bulk Import (CSV) + Bulk Edit**
- Admin page: `/admin/products-bulk`
- CSV Import: template download → upload → preview → validate → commit (title, sku, category_slug, brand_slug, price, stock, status, tags etc.)
- License Key Bulk Upload: paste বা CSV → package নির্বাচন → bulk insert
- Bulk Edit: existing products list-এ checkbox select → price%, status, category, tags change

**7. Admin Sidebar Reorganization**
AdminLayout-এ নতুন "Product Management" group:
- All Products | Categories | Brands | Tags | Variants | Digital Files | License Keys | Bulk Import/Edit

## Technical Details

```text
Database Migration (one big migration):
├── product_categories (id, name, slug, parent_id, description, image_url, sort_order, is_active)
├── product_brands (id, name, slug, logo_url, description, website_url, is_active)
├── product_tags (id, name, slug)
├── product_tag_relations (package_id, tag_id) [composite PK]
├── product_images (id, package_id, url, alt_text, sort_order, is_primary)
├── product_variants (id, package_id, sku, price, sale_price, stock_quantity, image_url, is_active)
├── product_variant_options (id, variant_id, option_name, option_value)
├── digital_files (id, package_id, file_url, file_name, file_size_bytes, version, download_limit, expiry_days, is_active)
├── license_keys (id, package_id, key_value UNIQUE, status, assigned_to_user_id, order_id, assigned_at)
├── digital_downloads (id, user_id, package_id, file_id, license_key_id, download_count, last_downloaded_at)
└── ALTER service_packages ADD: category_id, brand_id, sku, barcode,
        meta_title, meta_description, meta_keywords, og_image, canonical_url,
        scheduled_publish_at, publish_status, is_digital, weight_grams

RLS:
- Public read: categories/brands/tags/product_images/variants (is_active=true)
- Admin-only write: all above (via has_role check)
- digital_files, license_keys: admin-only read/write
- digital_downloads: user reads own + admin reads all

Storage:
- cms-media (existing, public) — product images, brand logos, category images
- digital-products (new, private) — digital files, accessed via signed URLs (1-hour expiry)

Triggers:
- assign_license_on_order_verified: payment_submissions status → 'verified' হলে
  matched order-এর package_id থেকে এক 'available' license key পেয়ে user-কে assign
- update_updated_at_column on all new tables

Edge functions:
- digital-download-signed-url: validate user owns license + within download limit + not expired → return signed URL, increment download_count
- bulk-import-products: CSV parse + validate + bulk insert (admin-only, JWT verified)

Frontend:
- src/hooks/useProductCategories.ts, useProductBrands.ts, useProductTags.ts,
  useProductVariants.ts, useDigitalFiles.ts, useLicenseKeys.ts, useMyDownloads.ts
- src/pages/admin/AdminCategories.tsx, AdminBrands.tsx, AdminTags.tsx,
  AdminProductVariants.tsx, AdminDigitalFiles.tsx, AdminLicenseKeys.tsx,
  AdminBulkProducts.tsx
- AdminServicePackages.tsx-এ tab-based edit: Basic | Images | Variants | SEO | Schedule | Digital
- DashboardPage-এ "My Downloads" tab
- ProductDetailsPage-এ variant selector + gallery slider
```

## Build Order

1. Migration (all tables + columns + RLS + triggers + storage bucket)
2. Hooks layer
3. Categories/Brands/Tags admin pages (simple CRUD first)
4. service_packages edit form refactor → tabbed: Basic/Images/SEO/Schedule
5. Variants admin UI
6. Digital files + License keys admin
7. License auto-assign trigger + signed-URL edge function
8. User Dashboard "My Downloads"
9. Bulk Import (CSV) + Bulk Edit
10. ProductDetailsPage: variant selector + gallery
11. AdminLayout sidebar update

## কী এই plan-এ নেই (পরে চাইলে যোগ হবে)

- Inventory tracking history / stock alerts
- Multi-currency pricing
- Product reviews moderation workflow (existing system আছে)
- Wishlists, compare list

Approve করলে আমি একটা migration দিয়ে শুরু করব (আপনি approve করার পর types regenerate হবে), তারপর code লিখব।

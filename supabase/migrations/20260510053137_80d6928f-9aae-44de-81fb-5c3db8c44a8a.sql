
-- Django: keep 3 (delete 2)
DELETE FROM public.product_reviews WHERE id IN ('f1532f8d-779b-41a2-8b90-697c3c0b86db','19f1b9fa-4cc8-481d-acb2-18574cc0bf44');

-- WP Business: keep 4 (delete 1)
DELETE FROM public.product_reviews WHERE id = 'd07b6095-2e1b-4847-a7f8-3960dd61db6f';

-- MERN: keep 2 (delete 3)
DELETE FROM public.product_reviews WHERE id IN ('c8ad2208-e7f0-4335-a22b-fc80210eebbf','2e78c8be-ab4a-42a5-ba45-57d89e015e47','3b35ac94-6d47-4dde-b44f-675d74ae9800');

-- WP Starter: keep 3 (delete 2)
DELETE FROM public.product_reviews WHERE id IN ('e07ac0d4-6f8c-481c-bb17-878d435a9689','bde6ed0d-5d34-4e86-bf64-8fbd42738ad7');

-- WP Premium: keep 4 (delete 1)
DELETE FROM public.product_reviews WHERE id = '05d4cc45-68a6-492a-b7dd-62c14e44aab7';

-- Add extras for variety (using random UUID for user_id since not FK)
INSERT INTO public.product_reviews (package_id, user_id, rating, comment) VALUES
-- Enterprise: +2 → 7
('361197e3-e778-4cc5-bb6d-ecd860f40e99', gen_random_uuid(), 5, 'বিশাল প্রজেক্ট হ্যান্ডেল করার ক্ষমতা প্রমাণিত।'),
('361197e3-e778-4cc5-bb6d-ecd860f40e99', gen_random_uuid(), 4, 'প্রাইস একটু বেশি, তবে কোয়ালিটি অসাধারণ।'),
-- React: +1 → 6
('65bd815f-4239-4725-9458-6f401189cbbc', gen_random_uuid(), 5, 'SPA পারফরমেন্স দারুণ, লোডিং স্পিড ফাস্ট।'),
-- Ecommerce: +3 → 8
('7649c915-cffc-4ff5-a7ea-33ef494eb864', gen_random_uuid(), 5, 'অর্ডার ম্যানেজমেন্ট সিস্টেম ইজি টু ইউজ।'),
('7649c915-cffc-4ff5-a7ea-33ef494eb864', gen_random_uuid(), 4, 'ইনভেন্টরি ট্র্যাকিং ফিচারটা অনেক হেল্পফুল।'),
('7649c915-cffc-4ff5-a7ea-33ef494eb864', gen_random_uuid(), 5, 'মাল্টি-ভেন্ডর সাপোর্টের জন্য পারফেক্ট।'),
-- AI SaaS: +4 → 9
('b339acb0-d671-435b-948a-19b6ef581eef', gen_random_uuid(), 5, 'AI মডেল ইন্টিগ্রেশন স্মুথ ছিল।'),
('b339acb0-d671-435b-948a-19b6ef581eef', gen_random_uuid(), 5, 'সাবস্ক্রিপশন বিলিং পুরোপুরি অটোমেটেড।'),
('b339acb0-d671-435b-948a-19b6ef581eef', gen_random_uuid(), 4, 'ডকুমেন্টেশন আরেকটু ডিটেইল হলে ভালো হতো।'),
('b339acb0-d671-435b-948a-19b6ef581eef', gen_random_uuid(), 5, 'আমাদের MRR ৩x বেড়েছে এই প্ল্যাটফর্ম লঞ্চের পর।');

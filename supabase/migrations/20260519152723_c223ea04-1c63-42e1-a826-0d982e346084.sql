INSERT INTO public.site_settings (key, value, type, group_name, label) VALUES
  ('wallet_topup_enabled', 'true',  'boolean', 'wallet', 'ওয়ালেট টপ-আপ সক্রিয়'),
  ('wallet_topup_method',  'bkash_online', 'text',  'wallet', 'টপ-আপ পেমেন্ট মেথড'),
  ('wallet_topup_min',     '100',   'number',  'wallet', 'সর্বনিম্ন টপ-আপ পরিমাণ (BDT)'),
  ('wallet_topup_max',     '100000','number',  'wallet', 'সর্বোচ্চ টপ-আপ পরিমাণ (BDT)'),
  ('wallet_topup_quick_amounts', '500,1000,2000,5000', 'text', 'wallet', 'কুইক টপ-আপ amount (কমা-দিয়ে আলাদা)'),
  ('wallet_topup_note',    'সফল পেমেন্টের পর আপনার ওয়ালেটে টাকা যোগ হবে।', 'text', 'wallet', 'টপ-আপ স্ক্রিনে দেখানো নোট')
ON CONFLICT (key) DO NOTHING;
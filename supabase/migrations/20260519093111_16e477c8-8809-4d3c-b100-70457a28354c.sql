ALTER TABLE public.bkash_transactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bkash_transactions;
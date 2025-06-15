
-- Update the default commission rate to 40% for new affiliates
ALTER TABLE public.affiliates ALTER COLUMN commission_rate SET DEFAULT 0.40;

-- Update existing affiliates to have 40% commission rate
UPDATE public.affiliates SET commission_rate = 0.40;

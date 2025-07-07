
-- Create the missing processed_payments table to prevent duplicate payment processing
CREATE TABLE public.processed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits_added INTEGER DEFAULT 0,
  subscription_plan TEXT,
  subscription_end TIMESTAMPTZ,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for the processed_payments table
ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for edge functions to insert payment records
CREATE POLICY "allow_payment_processing" ON public.processed_payments
  FOR ALL
  USING (true);

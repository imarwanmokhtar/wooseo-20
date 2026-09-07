
-- Create processed_payments table to track completed payments
CREATE TABLE IF NOT EXISTS public.processed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  credits_added INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own processed payments
CREATE POLICY "select_own_processed_payments" ON public.processed_payments
FOR SELECT
USING (user_id = auth.uid());

-- Create policy for edge functions to insert processed payments
CREATE POLICY "insert_processed_payments" ON public.processed_payments
FOR INSERT
WITH CHECK (true);

-- Create policy for edge functions to update processed payments
CREATE POLICY "update_processed_payments" ON public.processed_payments
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_payments_session_id ON public.processed_payments(session_id);
CREATE INDEX IF NOT EXISTS idx_processed_payments_user_id ON public.processed_payments(user_id);

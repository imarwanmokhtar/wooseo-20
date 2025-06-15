
-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view their own withdrawal requests" 
  ON public.withdrawal_requests 
  FOR SELECT 
  USING (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- Users can create their own withdrawal requests
CREATE POLICY "Users can create their own withdrawal requests" 
  ON public.withdrawal_requests 
  FOR INSERT 
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check minimum withdrawal amount
CREATE OR REPLACE FUNCTION public.check_withdrawal_eligibility(
  affiliate_id_param UUID,
  amount_param DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
  available_balance DECIMAL;
  min_withdrawal DECIMAL := 50.00; -- Set minimum withdrawal to $50
BEGIN
  -- Get available balance (total earnings minus already requested withdrawals)
  SELECT COALESCE(
    (SELECT total_earnings FROM public.affiliates WHERE id = affiliate_id_param) - 
    COALESCE(
      (SELECT SUM(amount) FROM public.withdrawal_requests 
       WHERE affiliate_id = affiliate_id_param 
       AND status IN ('pending', 'approved', 'processed')), 
      0
    ), 
    0
  ) INTO available_balance;
  
  -- Check if requested amount is valid
  RETURN amount_param >= min_withdrawal AND amount_param <= available_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure withdrawal amount meets requirements
ALTER TABLE public.withdrawal_requests 
ADD CONSTRAINT check_withdrawal_eligibility 
CHECK (public.check_withdrawal_eligibility(affiliate_id, amount));
